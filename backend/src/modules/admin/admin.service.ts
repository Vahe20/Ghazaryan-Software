import { prisma } from "../../config/prisma";
import { NotFoundError, DatabaseError } from "../../utils/errors";

interface GetUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
}

interface GetPurchasesParams {
	page?: number;
	limit?: number;
	userId?: string;
	appId?: string;
	status?: string;
}

export async function getUsers(params: GetUsersParams = {}) {
	try {
		const { page = 1, limit = 10, search, role } = params;
		const skip = (page - 1) * limit;

		const where: any = {};

		if (search) {
			where.OR = [
				{ email: { contains: search, mode: "insensitive" } },
				{ userName: { contains: search, mode: "insensitive" } },
			];
		}

		if (role) {
			where.role = role;
		}

		const [users, total] = await Promise.all([
			prisma.users.findMany({
				where,
				skip,
				take: limit,
				select: {
					id: true,
					email: true,
					userName: true,
					role: true,
					balance: true,
					avatarUrl: true,
					createdAt: true,
					lastLoginAt: true,
					_count: {
						select: {
							purchases: true,
							downloads: true,
							reviews: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.users.count({ where }),
		]);

		return {
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch users", error);
	}
}

export async function getPurchases(params: GetPurchasesParams = {}) {
	try {
		const { page = 1, limit = 10, userId, appId, status } = params;
		const skip = (page - 1) * limit;

		const where: any = {};

		if (userId) where.userId = userId;
		if (appId) where.appId = appId;
		if (status) where.status = status;

		const [purchases, total] = await Promise.all([
			prisma.purchases.findMany({
				where,
				skip,
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							userName: true,
							email: true,
							avatarUrl: true,
						},
					},
					app: {
						select: {
							id: true,
							name: true,
							iconUrl: true,
							slug: true,
						},
					},
				},
				orderBy: {
					purchasedAt: "desc",
				},
			}),
			prisma.purchases.count({ where }),
		]);

		return {
			purchases,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch purchases", error);
	}
}

export async function getDashboardStats() {
	try {
		const [
			totalUsers,
			totalApps,
			totalPurchases,
			totalRevenue,
			recentUsers,
			recentPurchases,
			topApps,
		] = await Promise.all([
			prisma.users.count(),
			prisma.apps.count(),
			prisma.purchases.count({
				where: { status: "COMPLETED" },
			}),
			prisma.purchases.aggregate({
				where: { status: "COMPLETED" },
				_sum: {
					price: true,
				},
			}),
			prisma.users.count({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					},
				},
			}),
			prisma.purchases.count({
				where: {
					status: "COMPLETED",
					purchasedAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					},
				},
			}),
			prisma.apps.findMany({
				take: 5,
				orderBy: {
					downloadCount: "desc",
				},
				select: {
					id: true,
					name: true,
					slug: true,
					iconUrl: true,
					downloadCount: true,
					rating: true,
					price: true,
				},
			}),
		]);

		const previousPeriodStart = new Date(
			Date.now() - 60 * 24 * 60 * 60 * 1000,
		);
		const previousPeriodEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const [previousUsers, previousPurchases, previousRevenue] =
			await Promise.all([
				prisma.users.count({
					where: {
						createdAt: {
							gte: previousPeriodStart,
							lt: previousPeriodEnd,
						},
					},
				}),
				prisma.purchases.count({
					where: {
						status: "COMPLETED",
						purchasedAt: {
							gte: previousPeriodStart,
							lt: previousPeriodEnd,
						},
					},
				}),
				prisma.purchases.aggregate({
					where: {
						status: "COMPLETED",
						purchasedAt: {
							gte: previousPeriodStart,
							lt: previousPeriodEnd,
						},
					},
					_sum: {
						price: true,
					},
				}),
			]);

		const userChange = previousUsers
			? ((recentUsers - previousUsers) / previousUsers) * 100
			: 0;

		const purchaseChange = previousPurchases
			? ((recentPurchases - previousPurchases) / previousPurchases) * 100
			: 0;

		const currentRevenue = Number(totalRevenue._sum.price || 0);
		const prevRevenue = Number(previousRevenue._sum.price || 0);
		const revenueChange = prevRevenue
			? ((currentRevenue - prevRevenue) / prevRevenue) * 100
			: 0;

		return {
			overview: {
				totalUsers,
				totalApps,
				totalPurchases,
				totalRevenue: currentRevenue,
				recentUsers,
				recentPurchases,
			},
			changes: {
				userChange: Math.round(userChange * 10) / 10,
				purchaseChange: Math.round(purchaseChange * 10) / 10,
				revenueChange: Math.round(revenueChange * 10) / 10,
				appChange: 0,
			},
			topApps,
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch dashboard statistics", error);
	}
}

export async function getRecentActivity() {
	try {
		const [recentUsers, recentPurchases, recentApps] = await Promise.all([
			prisma.users.findMany({
				take: 5,
				orderBy: {
					createdAt: "desc",
				},
				select: {
					id: true,
					userName: true,
					email: true,
					createdAt: true,
				},
			}),
			prisma.purchases.findMany({
				take: 5,
				where: {
					status: "COMPLETED",
				},
				orderBy: {
					purchasedAt: "desc",
				},
				include: {
					user: {
						select: {
							userName: true,
						},
					},
					app: {
						select: {
							name: true,
						},
					},
				},
			}),
			prisma.apps.findMany({
				take: 5,
				where: {
					publishedAt: {
						not: null,
					},
				},
				orderBy: {
					publishedAt: "desc",
				},
				select: {
					id: true,
					name: true,
					slug: true,
					publishedAt: true,
				},
			}),
		]);

		const activities: any[] = [];

		recentUsers.forEach((user: typeof recentUsers[0]) => {
			activities.push({
				type: "user_registered",
				timestamp: user.createdAt,
				description: `New user registered: ${user.userName}`,
				data: user,
			});
		});

		recentPurchases.forEach((purchase: typeof recentPurchases[0]) => {
			activities.push({
				type: "purchase_completed",
				timestamp: purchase.purchasedAt,
				description: `${purchase.user.userName} purchased ${purchase.app.name}`,
				data: purchase,
			});
		});

		recentApps.forEach((app: typeof recentApps[0]) => {
			activities.push({
				type: "app_published",
				timestamp: app.publishedAt,
				description: `New app published: ${app.name}`,
				data: app,
			});
		});

		activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		return activities.slice(0, 10);
	} catch (error) {
		throw new DatabaseError("Failed to fetch recent activity", error);
	}
}
