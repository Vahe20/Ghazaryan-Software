import { prisma } from "../../config/prisma";
import { CreateAppInput, UpdateAppInput, GetAppsQuery } from "./apps.types";
import { slugGenerator } from "../../utils/slugGenerator";
import { DownloadMetadata, Platform } from "../../types";

export async function getAllApps(query: GetAppsQuery) {
	const {
		page = 1,
		limit = 20,
		search,
		categoryId,
		status,
		sortBy = "createdAt",
		order = "desc",
	} = query;

	// Ensure limit is a number
	const limitNum = typeof limit === "number" ? limit : Number(limit);
	const pageNum = typeof page === "number" ? page : Number(page);

	const skip = (pageNum - 1) * limitNum;

	const where: any = {};

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
}

export async function getAppById(id: string) {
	return await prisma.apps.findUnique({
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
}

export async function getAppBySlug(slug: string) {
	return await prisma.apps.findUnique({
		where: { slug },
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
}

export async function addApp(data: CreateAppInput) {
	const category = await prisma.appsCategory.findUnique({
		where: { id: data.categoryId },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	const slug = data.slug || slugGenerator(data.name);

	const existingApp = await prisma.apps.findUnique({
		where: { slug },
	});

	if (existingApp) {
		throw new Error("App with this slug already exists");
	}

	return await prisma.apps.create({
		data: {
			...data,
			slug,
		},
		include: {
			category: true,
		},
	});
}

export async function updateAppById(id: string, data: UpdateAppInput) {
	const app = await prisma.apps.findUnique({
		where: { id },
	});

	if (!app) {
		throw new Error("App not found");
	}

	if (data.categoryId) {
		const category = await prisma.appsCategory.findUnique({
			where: { id: data.categoryId },
		});

		if (!category) {
			throw new Error("Category not found");
		}
	}

	if (data.slug) {
		const existingApp = await prisma.apps.findUnique({
			where: { slug: data.slug },
		});

		if (existingApp && existingApp.id !== id) {
			throw new Error("App with this slug already exists");
		}
	}

	return await prisma.apps.update({
		where: { id },
		data,
		include: {
			category: true,
		},
	});
}

export async function deleteAppById(id: string) {
	const app = await prisma.apps.findUnique({
		where: { id },
	});

	if (!app) {
		throw new Error("App not found");
	}

	return await prisma.apps.delete({ where: { id } });
}

export async function recordDownload(
	appId: string,
	userId?: string,
	metadata?: DownloadMetadata,
): Promise<void> {
	const app = await prisma.apps.findUnique({
		where: { id: appId },
	});

	if (!app) {
		throw new Error("App not found");
	}

	await prisma.downloads.create({
		data: {
			appId,
			userId,
			version: metadata?.version || app.version,
			platform: metadata?.platform as Platform,
			ipAddress: metadata?.ipAddress,
			userAgent: metadata?.userAgent,
			country: metadata?.country,
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
}

export async function getPopularApps(limit: number = 10): Promise<any[]> {
	return await prisma.apps.findMany({
		where: {
			status: "RELEASE",
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
}

export async function incrementViewCount(appId: string): Promise<void> {
	await prisma.apps.update({
		where: { id: appId },
		data: {
			viewCount: {
				increment: 1,
			},
		},
	});
}

export async function getUserLibrary(userId: string, query: GetAppsQuery) {
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

	// Получаем ID купленных приложений
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

	const where: any = {
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

	// Определяем сортировку
	let orderBy: any;
	if (sortBy === "purchasedAt") {
		// Для сортировки по дате покупки нужен особый подход
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

		// Сортируем в памяти по дате покупки
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
}
