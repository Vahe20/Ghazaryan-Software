import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ValidationError } from "../../utils/errors.js";
import { createPromotionSchema, updatePromotionSchema } from "./promotion.types.js";
import * as promotionService from "./promotion.service.js";

export const listPromotions = asyncHandler(async (req: Request, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const activeOnly = req.query.active === "true";
	const promotions = await promotionService.getPromotions(appId, activeOnly);
	res.json(promotions);
});

export const createPromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const data = createPromotionSchema.parse(req.body);
	const promotion = await promotionService.createPromotion(appId, data);
	res.status(201).json(promotion);
});

export const updatePromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { promotionId } = req.params;
	if (!promotionId || Array.isArray(promotionId)) {
		throw new ValidationError("Invalid promotionId parameter");
	}
	const data = updatePromotionSchema.parse(req.body);
	const promotion = await promotionService.updatePromotion(promotionId, data);
	res.json(promotion);
});

export const deletePromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { promotionId } = req.params;
	if (!promotionId || Array.isArray(promotionId)) {
		throw new ValidationError("Invalid promotionId parameter");
	}
	await promotionService.deletePromotion(promotionId);
	res.json({ message: "Promotion deleted" });
});
