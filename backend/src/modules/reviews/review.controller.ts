import { Response } from "express";
import { AuthRequest } from "../../types";
import { createReviewSchema } from "./review.types";
import * as reviewService from "./review.service";

export async function createReview(req: AuthRequest, res: Response) {
	if (!req.user) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const userId = req.user.userId;
	const appId = req.params.appId as string;

	const data = createReviewSchema.parse(req.body);

	const review = await reviewService.createReview(userId, appId, data);

	res.status(201).json(review);
}
