import type { Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { createReviewSchema, updateReviewSchema } from "./review.types.js";
import * as reviewService from "./review.service.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError, ValidationError } from "../../utils/errors.js";

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const data = createReviewSchema.parse(req.body);
	const review = await reviewService.createReview(req.user.userId, appId, data);
	res.status(201).json(review);
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	const { reviewId } = req.params;
	if (!reviewId || Array.isArray(reviewId)) {
		throw new ValidationError("Invalid reviewId parameter");
	}
	const data = updateReviewSchema.parse(req.body);
	const review = await reviewService.updateReview(reviewId, req.user.userId, data);
	res.json(review);
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	const { reviewId } = req.params;
	if (!reviewId || Array.isArray(reviewId)) {
		throw new ValidationError("Invalid reviewId parameter");
	}
	await reviewService.deleteReview(reviewId, req.user.userId, req.user.role);
	res.json({ message: "Review deleted" });
});

export const listReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const result = await reviewService.getReviews(appId, req.query as any);
	res.json(result);
});
