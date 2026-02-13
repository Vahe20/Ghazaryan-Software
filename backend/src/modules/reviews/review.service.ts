import { prisma } from "../../config/prisma";
import { recalcAppRating } from "../../services/rating.service";
import { CreateReviewData, UpdateReviewData } from "./review.types";
import { DatabaseError } from "../../utils/errors";

export async function createReview(
	userId: string,
	appId: string,
	data: CreateReviewData,
) {
	try {
		const review = await prisma.reviews.create({
			data: {
				...data,
				userId,
				appId,
			},
		});

		await recalcAppRating(appId);

		return review;
	} catch (error) {
		throw new DatabaseError("Failed to create review", error);
	}
}

export async function updateReview(reviewId: string, data: UpdateReviewData) {
	try {
		const review = await prisma.reviews.update({
			where: { id: reviewId },
			data,
		});

		await recalcAppRating(review.appId);

		return review;
	} catch (error) {
		throw new DatabaseError("Failed to update review", error);
	}
}

export async function deleteReview(reviewId: string) {
	try {
		const review = await prisma.reviews.delete({
			where: { id: reviewId },
		});

		await recalcAppRating(review.appId);
	} catch (error) {
		throw new DatabaseError("Failed to delete review", error);
	}
}
