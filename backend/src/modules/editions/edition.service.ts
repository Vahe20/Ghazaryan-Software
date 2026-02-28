import { prisma } from "../../config/prisma.js";
import { ApiError, DatabaseError, NotFoundError } from "../../utils/errors.js";
import type { CreateEditionInput, UpdateEditionInput } from "./edition.types.js";

export async function getEditions(appId: string) {
	try {
		return prisma.appEdition.findMany({
			where: { appId },
			include: {
				promotions: {
					where: {
						isActive: true,
						startsAt: { lte: new Date() },
						endsAt: { gte: new Date() },
					},
				},
			},
			orderBy: { price: "asc" },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch editions", error);
	}
}

export async function createEdition(appId: string, data: CreateEditionInput) {
	try {
		const app = await prisma.apps.findUnique({ where: { id: appId } });
		if (!app) throw new NotFoundError("App", appId);

		if (data.isDefault) {
			await prisma.appEdition.updateMany({
				where: { appId, isDefault: true },
				data: { isDefault: false },
			});
		}

		return prisma.appEdition.create({
			data: { ...data, appId },
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to create edition", error);
	}
}

export async function updateEdition(editionId: string, data: UpdateEditionInput) {
	try {
		const edition = await prisma.appEdition.findUnique({ where: { id: editionId } });
		if (!edition) throw new NotFoundError("Edition", editionId);

		if (data.isDefault) {
			await prisma.appEdition.updateMany({
				where: { appId: edition.appId, isDefault: true },
				data: { isDefault: false },
			});
		}

		return prisma.appEdition.update({ where: { id: editionId }, data });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to update edition", error);
	}
}

export async function deleteEdition(editionId: string) {
	try {
		const edition = await prisma.appEdition.findUnique({ where: { id: editionId } });
		if (!edition) throw new NotFoundError("Edition", editionId);
		await prisma.appEdition.delete({ where: { id: editionId } });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to delete edition", error);
	}
}
