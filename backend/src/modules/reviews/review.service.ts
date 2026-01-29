import { prisma } from "../../config/prisma";
import { recalcAppRating } from "../../services/rating.service";
import { CreateReviewData, UpdateReviewData } from "./review.types";

export async function createReview(
	userId: string,
	appId: string,
	data: CreateReviewData,
) {
	const review = await prisma.reviews.create({
		data: {
			...data,
			userId,
			appId,
		},
	});

	await recalcAppRating(appId);

	return review;
}

export async function updateReview(reviewId: string, data: UpdateReviewData) {
	const review = await prisma.reviews.update({
		where: { id: reviewId },
		data,
	});

	await recalcAppRating(review.appId);

	return review;
}

export async function deleteReview(reviewId: string) {
	const review = await prisma.reviews.delete({
		where: { id: reviewId },
	});

	await recalcAppRating(review.appId);
}
