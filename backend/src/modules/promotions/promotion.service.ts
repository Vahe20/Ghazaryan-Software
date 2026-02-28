import { prisma } from "../../config/prisma.js";
import { ApiError, DatabaseError, NotFoundError } from "../../utils/errors.js";
import type { CreatePromotionInput, UpdatePromotionInput } from "./promotion.types.js";

export async function getPromotions(appId: string, activeOnly = false) {
	try {
		const now = new Date();
		return prisma.appPromotion.findMany({
			where: {
				appId,
				...(activeOnly && {
					isActive: true,
					startsAt: { lte: now },
					endsAt: { gte: now },
				}),
			},
			include: { edition: true },
			orderBy: { startsAt: "desc" },
		});
	} catch (error) {
		throw new DatabaseError("Failed to fetch promotions", error);
	}
}

export async function createPromotion(appId: string, data: CreatePromotionInput) {
	try {
		const app = await prisma.apps.findUnique({ where: { id: appId } });
		if (!app) throw new NotFoundError("App", appId);

		if (data.editionId) {
			const edition = await prisma.appEdition.findUnique({ where: { id: data.editionId } });
			if (!edition || edition.appId !== appId) throw ApiError.badRequest("Edition not found for this app");
		}

		return prisma.appPromotion.create({
			data: { ...data, appId },
			include: { edition: true },
		});
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to create promotion", error);
	}
}

export async function updatePromotion(promotionId: string, data: UpdatePromotionInput) {
	try {
		const promotion = await prisma.appPromotion.findUnique({ where: { id: promotionId } });
		if (!promotion) throw new NotFoundError("Promotion", promotionId);
		return prisma.appPromotion.update({ where: { id: promotionId }, data });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to update promotion", error);
	}
}

export async function deletePromotion(promotionId: string) {
	try {
		const promotion = await prisma.appPromotion.findUnique({ where: { id: promotionId } });
		if (!promotion) throw new NotFoundError("Promotion", promotionId);
		await prisma.appPromotion.delete({ where: { id: promotionId } });
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to delete promotion", error);
	}
}
