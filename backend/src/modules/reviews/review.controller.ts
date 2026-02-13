import { Response } from "express";
import { AuthRequest } from "../../types";
import { createReviewSchema } from "./review.types";
import * as reviewService from "./review.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ApiError } from "../../utils/errors";

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const userId = req.user.userId;
	const appId = req.params.appId as string;

	const data = createReviewSchema.parse(req.body);

	const review = await reviewService.createReview(userId, appId, data);

	res.status(201).json(review);
});
