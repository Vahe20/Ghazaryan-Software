import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { createPromotionSchema, updatePromotionSchema } from "./promotion.types.js";
import * as promotionService from "./promotion.service.js";

export const listPromotions = asyncHandler(async (req: Request, res: Response) => {
	const activeOnly = req.query.active === "true";
	const promotions = await promotionService.getPromotions(req.params.appId, activeOnly);
	res.json(promotions);
});

export const createPromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = createPromotionSchema.parse(req.body);
	const promotion = await promotionService.createPromotion(req.params.appId, data);
	res.status(201).json(promotion);
});

export const updatePromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = updatePromotionSchema.parse(req.body);
	const promotion = await promotionService.updatePromotion(req.params.promotionId, data);
	res.json(promotion);
});

export const deletePromotion = asyncHandler(async (req: AuthRequest, res: Response) => {
	await promotionService.deletePromotion(req.params.promotionId);
	res.json({ message: "Promotion deleted" });
});
