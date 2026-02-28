import { prisma } from "../../config/prisma.js";
import type { CreateAppInput, UpdateAppInput, GetAppsQuery } from "./apps.types.js";
import { slugGenerator } from "../../utils/slugGenerator.js";
import type { DownloadMetadata, Platform, AppStatus } from "../../types/index.js";
import {
	NotFoundError,
	ConflictError,
	DatabaseError,
} from "../../utils/errors.js";

export async function getAllApps(query: GetAppsQuery) {
	try {
		const {
			page = 1,
			limit = 20,
			search,
			categoryId,
			status,
			platform,
			sortBy = "createdAt",
			order = "desc",
		} = query;

		const limitNum = typeof limit === "number" ? limit : Number(limit);
		const pageNum = typeof page === "number" ? page : Number(page);
		const skip = (pageNum - 1) * limitNum;

		interface WhereCondition {
			deletedAt: null;
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				shortDesc?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
				tags?: { hasSome: string[] };
			}>;
			categoryId?: string;
			status?: AppStatus;
			platform?: { has: Platform };
		}

		const where: WhereCondition = { deletedAt: null };

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ shortDesc: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ tags: { hasSome: [search] } },
			];
		}

		if (categoryId) {
			where.categoryId = categoryId;
		}

		if (status) {
			where.status = status;
		}

		if (platform) {
			where.platform = { has: platform };
		}

		const total = await prisma.apps.count({ where });

		const apps = await prisma.apps.findMany({
			where,
			skip,
			take: limitNum,
			orderBy: { [sortBy]: order },
			include: {
				category: true,
				_count: {
					select: {
						reviews: true,
						downloads: true,
					},
				},
			},
		});

		return {
			apps,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				totalPages: Math.ceil(total / limitNum),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch apps", error);
	}
}

export async function getAppById(id: string) {
	try {
		return await prisma.apps.findFirst({
			where: { id },
			include: {
				category: true,
				versions: {
					orderBy: { releaseDate: "desc" },
					take: 5,
				},
				reviews: {
					orderBy: { createdAt: "desc" },
					take: 10,
					include: {
						user: {
							select: {
								id: true,
								userName: true,
								avatarUrl: true,
							},
						},
					},
				},
				_count: {
					select: {
						reviews: true,
						downloads: true,
					},
				},
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch app", error);
	}
}

export async function getAppBySlug(slug: string) {
	try {
		return await prisma.apps.findFirst({
			where: { slug, deletedAt: null },
			include: {
				category: true,
				versions: {
					orderBy: { releaseDate: "desc" },
					take: 5,
				},
				reviews: {
					orderBy: { createdAt: "desc" },
					take: 10,
					include: {
						user: {
							select: {
								id: true,
								userName: true,
								avatarUrl: true,
							},
						},
					},
				},
				_count: {
					select: {
						reviews: true,
						downloads: true,
					},
				},
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch app", error);
	}
}

export async function addApp(data: CreateAppInput) {
	try {
		const category = await prisma.appsCategory.findUnique({
			where: { id: data.categoryId },
		});

		if (!category) {
			throw new NotFoundError("Category", data.categoryId);
		}

		const slug = data.slug || slugGenerator(data.name);

		const existingApp = await prisma.apps.findUnique({
			where: { slug },
		});

		if (existingApp) {
			throw new ConflictError("App with this slug already exists");
		}

		return await prisma.apps.create({
			data: {
				...data,
				slug,
				changelog: data.changelog ?? null,
				coverUrl: data.coverUrl ?? null,
				sourceUrl: data.sourceUrl ?? null,
				documentationUrl: data.documentationUrl ?? null,
			},
			include: {
				category: true,
			},
		});
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof ConflictError) {
			throw error;
		}
		throw new DatabaseError("Failed to create app", error);
	}
}

export async function updateAppById(id: string, data: UpdateAppInput) {
	try {
		const app = await prisma.apps.findUnique({
			where: { id },
		});

		if (!app) {
			throw new NotFoundError("App", id);
		}

		if (data.categoryId) {
			const category = await prisma.appsCategory.findUnique({
				where: { id: data.categoryId },
			});

			if (!category) {
				throw new NotFoundError("Category", data.categoryId);
			}
		}

		if (data.slug) {
			const existingApp = await prisma.apps.findUnique({
				where: { slug: data.slug },
			});

			if (existingApp && existingApp.id !== id) {
				throw new ConflictError("App with this slug already exists");
			}
		}

		return await prisma.apps.update({
			where: { id },
			data: {
				...data,
				changelog: data.changelog !== undefined ? (data.changelog ?? null) : undefined,
				coverUrl: data.coverUrl !== undefined ? (data.coverUrl ?? null) : undefined,
				sourceUrl: data.sourceUrl !== undefined ? (data.sourceUrl ?? null) : undefined,
				documentationUrl: data.documentationUrl !== undefined ? (data.documentationUrl ?? null) : undefined,
			},
			include: {
				category: true,
			},
		});
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof ConflictError) {
			throw error;
		}
		throw new DatabaseError("Failed to update app", error);
	}
}

export async function deleteAppById(id: string) {
	try {
		const app = await prisma.apps.findUnique({
			where: { id },
		});

		if (!app) {
			throw new NotFoundError("App", id);
		}

		return await prisma.apps.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to delete app", error);
	}
}

export async function recordDownload(
	appId: string,
	userId?: string,
	metadata?: DownloadMetadata,
): Promise<void> {
	try {
		const app = await prisma.apps.findFirst({
			where: { id: appId },
		});

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		await prisma.downloads.create({
			data: {
				appId,
				userId: userId ?? null,
				version: metadata?.version || app.version,
				platform: metadata?.platform as Platform,
				ipAddress: metadata?.ipAddress ?? null,
				userAgent: metadata?.userAgent ?? null,
				country: metadata?.country ?? null,
			},
		});

		await prisma.apps.update({
			where: { id: appId },
			data: {
				downloadCount: {
					increment: 1,
				},
			},
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to record download", error);
	}
}

export async function getPopularApps(limit: number = 10) {
	try {
		return await prisma.apps.findMany({
			where: {
				status: "RELEASE",
				deletedAt: null,
			},
			take: limit,
			orderBy: [{ downloadCount: "desc" }, { rating: "desc" }],
			include: {
				category: true,
				_count: {
					select: {
						reviews: true,
						downloads: true,
					},
				},
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch popular apps", error);
	}
}

export async function incrementViewCount(appId: string): Promise<void> {
	try {
		await prisma.apps.update({
			where: { id: appId },
			data: {
				viewCount: {
					increment: 1,
				},
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to increment view count", error);
	}
}

export async function getUserLibrary(userId: string, query: GetAppsQuery) {
	try {
		const {
			page = 1,
			limit = 20,
			search,
			sortBy = "purchasedAt",
			order = "desc",
		} = query;

		const limitNum = typeof limit === "number" ? limit : Number(limit);
		const pageNum = typeof page === "number" ? page : Number(page);
		const skip = (pageNum - 1) * limitNum;

		const purchases = await prisma.purchases.findMany({
			where: {
				userId,
				status: "COMPLETED",
			},
			select: {
				appId: true,
				purchasedAt: true,
			},
		});

		const appIds = purchases.map(p => p.appId);

		if (appIds.length === 0) {
			return {
				apps: [],
				pagination: {
					page: pageNum,
					limit: limitNum,
					total: 0,
					totalPages: 0,
				},
			};
		}

		interface LibraryWhereCondition {
			id: { in: string[] };
			OR?: Array<{
				name?: { contains: string; mode: "insensitive" };
				shortDesc?: { contains: string; mode: "insensitive" };
				description?: { contains: string; mode: "insensitive" };
				tags?: { hasSome: string[] };
			}>;
		}

		const where: LibraryWhereCondition = {
			id: { in: appIds },
		};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ shortDesc: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ tags: { hasSome: [search] } },
			];
		}

		const total = await prisma.apps.count({ where });

		type OrderBy = { [key: string]: "asc" | "desc" };
		let orderBy: OrderBy | undefined;
		if (sortBy === "purchasedAt") {
			const apps = await prisma.apps.findMany({
				where,
				include: {
					category: true,
					purchases: {
						where: { userId },
						select: { purchasedAt: true },
					},
					_count: {
						select: {
							reviews: true,
							downloads: true,
						},
					},
				},
			});

			const sortedApps = apps.sort((a, b) => {
				const dateA = a.purchases[0]?.purchasedAt || new Date(0);
				const dateB = b.purchases[0]?.purchasedAt || new Date(0);
				return order === "desc"
					? dateB.getTime() - dateA.getTime()
					: dateA.getTime() - dateB.getTime();
			});

			const paginatedApps = sortedApps.slice(skip, skip + limitNum);

			return {
				apps: paginatedApps,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total,
					totalPages: Math.ceil(total / limitNum),
				},
			};
		} else {
			orderBy = { [sortBy]: order };
			const apps = await prisma.apps.findMany({
				where,
				skip,
				take: limitNum,
				orderBy,
				include: {
					category: true,
					purchases: {
						where: { userId },
						select: { purchasedAt: true },
					},
					_count: {
						select: {
							reviews: true,
							downloads: true,
						},
					},
				},
			});

			return {
				apps,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total,
					totalPages: Math.ceil(total / limitNum),
				},
			};
		}
	} catch (error) {
		throw new DatabaseError("Failed to fetch user library", error);
	}
}
