import { prisma } from "../../config/prisma";
import { Prisma, PurchaseStatus } from "../../generated/prisma";
import { UserRole } from "../../types";
import { NotFoundError, DatabaseError } from "../../utils/errors";

const userSelect = {
	id: true,
	email: true,
	userName: true,
	role: true,
	balance: true,
	avatarUrl: true,
	createdAt: true,
	lastLoginAt: true,
	isBanned: true,
	bannedUntil: true,
	banReason: true,
	_count: {
		select: {
			purchases: true,
			downloads: true,
			reviews: true,
		},
	},
} as const;

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

interface GetUserSubParams {
	page?: number;
	limit?: number;
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

export async function getUserById(id: string) {
	try {
		const user = await prisma.users.findUnique({
			where: { id },
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
		});

		if (!user) throw new NotFoundError("User not found");

		return user;
	} catch (error) {
		if (error instanceof NotFoundError) throw error;
		throw new DatabaseError("Failed to fetch user", error);
	}
}

export async function updateUserRole(id: string, role: UserRole) {
	try {
		return await prisma.users.update({
			where: { id },
			data: { role },
			select: userSelect,
		});
	} catch (error) {
		throw new DatabaseError("Failed to update user role", error);
	}
}

export async function banUser(
	id: string,
	data: { reason?: string; until?: string | null },
) {
	try {
		return await prisma.users.update({
			where: { id },
			data: {
				isBanned: true,
				bannedUntil: data.until ? new Date(data.until) : null,
				banReason: data.reason ?? null,
			},
			select: userSelect,
		});
	} catch (error) {
		throw new DatabaseError("Failed to ban user", error);
	}
}

export async function unbanUser(id: string) {
	try {
		return await prisma.users.update({
			where: { id },
			data: {
				isBanned: false,
				bannedUntil: null,
				banReason: null,
			},
			select: userSelect,
		});
	} catch (error) {
		throw new DatabaseError("Failed to unban user", error);
	}
}

export async function deleteUser(id: string) {
	try {
		return await prisma.users.delete({
			where: { id },
			select: userSelect,
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete user", error);
	}
}

export async function getUserPurchases(
	id: string,
	params: GetUserSubParams = {},
) {
	try {
		const { page = 1, limit = 10 } = params;
		const skip = (page - 1) * limit;

		const [purchases, total] = await Promise.all([
			prisma.purchases.findMany({
				where: { userId: id },
				skip,
				take: limit,
				select: {
					id: true,
					appId: true,
					price: true,
					status: true,
					purchasedAt: true,
					paymentMethod: true,
					app: {
						select: {
							id: true,
							name: true,
							iconUrl: true,
							slug: true,
						},
					},
				},
				orderBy: { purchasedAt: "desc" },
			}),
			prisma.purchases.count({ where: { userId: id } }),
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
		throw new DatabaseError("Failed to fetch user purchases", error);
	}
}

export async function getUserDownloads(
	id: string,
	params: GetUserSubParams = {},
) {
	try {
		const { page = 1, limit = 10 } = params;
		const skip = (page - 1) * limit;

		const [downloads, total] = await Promise.all([
			prisma.downloads.findMany({
				where: { userId: id },
				skip,
				take: limit,
				select: {
					id: true,
					version: true,
					platform: true,
					downloadedAt: true,
					app: {
						select: {
							id: true,
							name: true,
							iconUrl: true,
							slug: true,
						},
					},
				},
				orderBy: { downloadedAt: "desc" },
			}),
			prisma.downloads.count({ where: { userId: id } }),
		]);

		return {
			downloads,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch user downloads", error);
	}
}

export async function getUserReviews(
	id: string,
	params: GetUserSubParams = {},
) {
	try {
		const { page = 1, limit = 10 } = params;
		const skip = (page - 1) * limit;

		const [reviews, total] = await Promise.all([
			prisma.reviews.findMany({
				where: { userId: id },
				skip,
				take: limit,
				select: {
					id: true,
					rating: true,
					title: true,
					comment: true,
					createdAt: true,
					app: {
						select: {
							id: true,
							name: true,
							iconUrl: true,
							slug: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.reviews.count({ where: { userId: id } }),
		]);

		return {
			reviews,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch user reviews", error);
	}
}

export async function getPurchases(params: GetPurchasesParams = {}) {
	try {
		const { page = 1, limit = 10, userId, appId, status } = params;
		const skip = (page - 1) * limit;

		const where: Prisma.PurchasesWhereInput = {};
		if (userId) where.userId = userId;
		if (appId) where.appId = appId;
		if (status) where.status = status as PurchaseStatus;

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
				orderBy: { purchasedAt: "desc" },
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
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

		const [
			totalUsers,
			totalApps,
			totalPurchases,
			totalRevenue,
			recentUsers,
			recentPurchases,
			topApps,
			previousUsers,
			previousPurchases,
			previousRevenue,
		] = await Promise.all([
			prisma.users.count(),
			prisma.apps.count(),
			prisma.purchases.count({ where: { status: "COMPLETED" } }),
			prisma.purchases.aggregate({
				where: { status: "COMPLETED" },
				_sum: { price: true },
			}),
			prisma.users.count({
				where: { createdAt: { gte: thirtyDaysAgo } },
			}),
			prisma.purchases.count({
				where: {
					status: "COMPLETED",
					purchasedAt: { gte: thirtyDaysAgo },
				},
			}),
			prisma.apps.findMany({
				take: 5,
				orderBy: { downloadCount: "desc" },
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
			prisma.users.count({
				where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
			}),
			prisma.purchases.count({
				where: {
					status: "COMPLETED",
					purchasedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
				},
			}),
			prisma.purchases.aggregate({
				where: {
					status: "COMPLETED",
					purchasedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
				},
				_sum: { price: true },
			}),
		]);

		const currentRevenue = Number(totalRevenue._sum.price ?? 0);
		const prevRevenue = Number(previousRevenue._sum.price ?? 0);
		const pct = (a: number, b: number) => {
			if (b === 0) {
				return a === 0 ? 0 : 100;
			}
			return Math.round(((a - b) / b) * 1000) / 10;
		};

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
				userChange: pct(recentUsers, previousUsers),
				purchaseChange: pct(recentPurchases, previousPurchases),
				revenueChange: pct(currentRevenue, prevRevenue),
				appChange: 0,
			},
			topApps,
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch dashboard statistics", error);
	}
}

interface ActivityItem {
	type: "user_registered" | "purchase_completed" | "app_published";
	timestamp: Date;
	description: string;
	data: Record<string, unknown>;
}

export async function getRecentActivity() {
	try {
		const [recentUsers, recentPurchases, recentApps] = await Promise.all([
			prisma.users.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					userName: true,
					email: true,
					createdAt: true,
				},
			}),
			prisma.purchases.findMany({
				take: 5,
				where: { status: "COMPLETED" },
				orderBy: { purchasedAt: "desc" },
				include: {
					user: { select: { userName: true } },
					app: { select: { name: true } },
				},
			}),
			prisma.apps.findMany({
				take: 5,
				where: { publishedAt: { not: null } },
				orderBy: { publishedAt: "desc" },
				select: { id: true, name: true, slug: true, publishedAt: true },
			}),
		]);

		const activities: ActivityItem[] = [];

		for (const user of recentUsers) {
			activities.push({
				type: "user_registered",
				timestamp: user.createdAt,
				description: `New user registered: ${user.userName}`,
				data: user as Record<string, unknown>,
			});
		}

		for (const purchase of recentPurchases) {
			activities.push({
				type: "purchase_completed",
				timestamp: purchase.purchasedAt,
				description: `${purchase.user.userName} purchased ${purchase.app.name}`,
				data: purchase as unknown as Record<string, unknown>,
			});
		}

		for (const app of recentApps) {
			if (!app.publishedAt) continue;
			activities.push({
				type: "app_published",
				timestamp: app.publishedAt,
				description: `New app published: ${app.name}`,
				data: app as Record<string, unknown>,
			});
		}

		return activities
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, 10);
	} catch (error) {
		throw new DatabaseError("Failed to fetch recent activity", error);
	}
}
