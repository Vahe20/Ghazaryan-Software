import type { CreateAppInput, UpdateAppInput, GetAppsQuery, CreateVersionData } from "./apps.types.js";
import { slugGenerator } from "../../utils/slugGenerator.js";
import { sanitizeSearchQuery, sanitizeNumericInput } from "../../utils/sanitizer.js";
import { getCached, setCached, deleteCachedByPattern, hashObject, withCache } from "../../utils/cache.js";
import type { DownloadMetadata, Platform, AppStatus } from "../../types/index.js";
import {
	NotFoundError,
	ConflictError,
	DatabaseError,
} from "../../utils/errors.js";
import { appRepository } from "../../repositories/app.repository.js";
import { prisma } from "../../config/prisma.js";

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

		const sanitizedSearch = sanitizeSearchQuery(search);
		const limitNum = sanitizeNumericInput(limit, 20, 1, 100);
		const pageNum = sanitizeNumericInput(page, 1, 1, 1000);

		// Создаем кеш-ключ из параметров запроса
		const cacheKey = `apps:list:${hashObject({
			search: sanitizedSearch,
			categoryId,
			status,
			platform,
			sortBy,
			order,
			page: pageNum,
			limit: limitNum,
		})}`;

		// Проверяем кеш (TTL: 5 минут)
		const cached = await getCached(cacheKey);
		if (cached) {
			console.log(`✅ Cache hit for ${cacheKey}`);
			return cached;
		}

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

		if (sanitizedSearch) {
			where.OR = [
				{ name: { contains: sanitizedSearch, mode: "insensitive" } },
				{ shortDesc: { contains: sanitizedSearch, mode: "insensitive" } },
				{ description: { contains: sanitizedSearch, mode: "insensitive" } },
				{ tags: { hasSome: [sanitizedSearch] } },
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

		const total = await appRepository.count(where);

		const apps = await appRepository.findMany({
			where,
			skip,
			take: limitNum,
			orderBy: { [sortBy]: order },
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
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

		const result = {
			apps,
			pagination: {
				page: pageNum,
				limit: limitNum,
				total,
				totalPages: Math.ceil(total / limitNum),
			},
		};

		// Сохраняем в кеш на 5 минут
		await setCached(cacheKey, result, 300);

		return result;
	} catch (error) {
		throw new DatabaseError("Failed to fetch apps", error);
	}
}
// Version management functions
export async function addVersion(
	appId: string,
	data: CreateVersionData,
	file: Express.Multer.File,
) {
	try {
		const app = await appRepository.findById(appId);

		if (!app) {
			throw new NotFoundError("App", appId);
		}

		return prisma.appsVersion.create({
			data: {
				appId,
				version: data.version,
				changelog: data.changelog,
				isStable: data.isStable,
				downloadUrl: `/uploads/versions/${file.filename}`,
				size: file.size,
			},
		});
	} catch (error) {
		if (error instanceof NotFoundError) {
			throw error;
		}
		throw new DatabaseError("Failed to create version", error);
	}
}

export async function getVersions(appId: string) {
	try {
		return prisma.appsVersion.findMany({
			where: { appId },
			orderBy: { releaseDate: "desc" },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch versions", error);
	}
}
export async function getAppById(id: string) {
	try {
		// Кешируем на 10 минут (приложения редко меняются)
		const cacheKey = `app:${id}`;
		return await withCache(cacheKey, async () => {
			return await appRepository.findByIdWithDetails(id);
		}, 600);
	} catch (error) {
		throw new DatabaseError("Failed to fetch app", error);
	}
}

export async function getAppBySlug(slug: string) {
	try {
		// Кешируем на 10 минут
		const cacheKey = `app:slug:${slug}`;
		return await withCache(cacheKey, async () => {
			return await appRepository.findBySlug(slug);
		}, 600);
	} catch (error) {
		throw new DatabaseError("Failed to fetch app by slug", error);
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

		const updatedApp = await prisma.apps.update({
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

		// Инвалидируем кеш
		await deleteCachedByPattern(`app:${id}*`);
		await deleteCachedByPattern("apps:list:*");

		return updatedApp;
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof ConflictError) {
			throw error;
		}
		throw new DatabaseError("Failed to update app", error);
	}
}

export async function deleteAppById(id: string) {
	try {
		const app = await appRepository.findById(id);

		if (!app) {
			throw new NotFoundError("App", id);
		}

		const deletedApp = await appRepository.delete(id);

		// Инвалидируем кеш
		await deleteCachedByPattern(`app:${id}*`);
		await deleteCachedByPattern("apps:list:*");

		return deletedApp;
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
		const app = await appRepository.findById(appId);

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

export async function incrementViewCount(appId: string): Promise<void> {
	try {
		await appRepository.incrementViewCount(appId);
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
