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

	const skip = (page - 1) * limit;

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
		take: limit,
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
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
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
