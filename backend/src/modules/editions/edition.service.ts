import { prisma } from "../../config/prisma.js";
import { ApiError, ConflictError, DatabaseError, NotFoundError, ValidationError } from "../../utils/errors.js";
import type { CreateEditionInput, UpdateEditionInput, LinkEditionInput } from "./edition.types.js";

function generateSlug(name: string): string {
	return name.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export async function getEditions(appId: string) {
	try {
		return prisma.apps.findMany({
			where: {
				parentAppId: appId,
				deletedAt: null,
			},
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				slug: true,
				shortDesc: true,
				price: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch editions", error);
	}
}

export async function createEdition(appId: string, data: CreateEditionInput) {
	try {
		// Check parent app exists
		const parentApp = await prisma.apps.findFirst({ 
			where: { id: appId, deletedAt: null } 
		});
		
		if (!parentApp) throw new NotFoundError("App", appId);

		// Generate slug if not provided
		const slug = data.slug || generateSlug(data.name);

		// Check if slug is unique
		const existingApp = await prisma.apps.findFirst({
			where: { slug, deletedAt: null }
		});

		if (existingApp) {
			throw new ConflictError(`App with slug "${slug}" already exists`);
		}

		// Create new edition app with minimal required fields
		return prisma.apps.create({
			data: {
				name: data.name,
				slug,
				shortDesc: data.shortDesc || `${data.name} edition`,
				description: `${data.name} edition of ${parentApp.name}`,
				iconUrl: parentApp.iconUrl, // Copy from parent
				coverUrl: parentApp.coverUrl,
				screenshots: parentApp.screenshots,
				categoryId: parentApp.categoryId,
				tags: parentApp.tags,
				size: parentApp.size,
				platform: parentApp.platform,
				price: data.price,
				status: data.status || "RELEASE",
				parentAppId: appId,
				authorId: parentApp.authorId,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				shortDesc: true,
				price: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to create edition", error);
	}
}

export async function linkEdition(appId: string, data: LinkEditionInput) {
	try {
		if (data.editionAppId === appId) {
			throw new ValidationError("App cannot be an edition of itself");
		}

		const [parentApp, editionApp] = await Promise.all([
			prisma.apps.findFirst({ where: { id: appId, deletedAt: null } }),
			prisma.apps.findFirst({ where: { id: data.editionAppId, deletedAt: null } }),
		]);

		if (!parentApp) throw new NotFoundError("App", appId);
		if (!editionApp) throw new NotFoundError("Edition app", data.editionAppId);

		if (editionApp.parentAppId && editionApp.parentAppId !== appId) {
			throw new ConflictError("Edition app is already attached to another app");
		}

		return prisma.apps.update({
			where: { id: data.editionAppId },
			data: { parentAppId: appId },
			select: {
				id: true,
				name: true,
				slug: true,
				shortDesc: true,
				price: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to link edition", error);
	}
}

export async function updateEdition(appId: string, editionId: string, data: UpdateEditionInput) {
	try {
		const edition = await prisma.apps.findFirst({
			where: {
				id: editionId,
				parentAppId: appId,
				deletedAt: null,
			},
		});

		if (!edition) throw new NotFoundError("Edition", editionId);

		// Check slug uniqueness if changing
		if (data.slug && data.slug !== edition.slug) {
			const existingApp = await prisma.apps.findFirst({
				where: { 
					slug: data.slug, 
					deletedAt: null,
					id: { not: editionId }
				}
			});

			if (existingApp) {
				throw new ConflictError(`App with slug "${data.slug}" already exists`);
			}
		}

		return prisma.apps.update({
			where: { id: editionId },
			data,
			select: {
				id: true,
				name: true,
				slug: true,
				shortDesc: true,
				price: true,
				status: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to update edition", error);
	}
}

export async function deleteEdition(appId: string, editionId: string) {
	try {
		const edition = await prisma.apps.findFirst({
			where: {
				id: editionId,
				parentAppId: appId,
				deletedAt: null,
			},
		});

		if (!edition) throw new NotFoundError("Edition", editionId);

		// Unlink the edition (don't delete the app, just remove parent relationship)
		await prisma.apps.update({
			where: { id: editionId },
			data: { parentAppId: null },
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to delete edition", error);
	}
}
