import { prisma } from "../../config/prisma.js";
import { recalcAppRating } from "../../services/rating.service.js";
import type { CreateReviewData, UpdateReviewData } from "./review.types.js";
import { DatabaseError, ConflictError, ApiError } from "../../utils/errors.js";

export async function createReview(userId: string, appId: string, data: CreateReviewData) {
	try {
		const app = await prisma.apps.findUnique({ where: { id: appId } });
		if (!app) throw ApiError.notFound("App not found");

		if (Number(app.price) > 0) {
			const purchase = await prisma.purchases.findUnique({
				where: { userId_appId: { userId, appId } },
			});
			if (!purchase || purchase.status !== "COMPLETED") {
				throw ApiError.forbidden("You must own this app to leave a review");
			}
		}

		const existing = await prisma.reviews.findUnique({
			where: { appId_userId: { appId, userId } },
		});
		if (existing) throw new ConflictError("You have already reviewed this app");

		const review = await prisma.reviews.create({
			data: { ...data, userId, appId },
		});

		await recalcAppRating(appId);
		return review;
	} catch (error) {
		if (error instanceof ApiError || error instanceof ConflictError) throw error;
		throw new DatabaseError("Failed to create review", error);
	}
}

export async function updateReview(reviewId: string, userId: string, data: UpdateReviewData) {
	try {
		const review = await prisma.reviews.findUnique({ where: { id: reviewId } });
		if (!review) throw ApiError.notFound("Review not found");
		if (review.userId !== userId) throw ApiError.forbidden("Not your review");

		const updated = await prisma.reviews.update({
			where: { id: reviewId },
			data,
		});

		await recalcAppRating(updated.appId);
		return updated;
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to update review", error);
	}
}

export async function deleteReview(reviewId: string, userId: string, role: string) {
	try {
		const review = await prisma.reviews.findUnique({ where: { id: reviewId } });
		if (!review) throw ApiError.notFound("Review not found");
		if (review.userId !== userId && role !== "ADMIN") throw ApiError.forbidden("Not your review");

		await prisma.reviews.delete({ where: { id: reviewId } });
		await recalcAppRating(review.appId);
	} catch (error) {
		if (error instanceof ApiError) throw error;
		throw new DatabaseError("Failed to delete review", error);
	}
}

export async function getReviews(appId: string, query: { page?: number; limit?: number; rating?: number; sortBy?: string; order?: string }) {
	try {
		const page = Number(query.page) || 1;
		const limit = Number(query.limit) || 20;
		const skip = (page - 1) * limit;

		const where: any = { appId };
		if (query.rating) where.rating = query.rating;

		const sortBy = query.sortBy ?? "createdAt";
		const order = query.order ?? "desc";

		const [reviews, total] = await Promise.all([
			prisma.reviews.findMany({
				where,
				skip,
				take: limit,
				orderBy: { [sortBy]: order },
				include: {
					user: {
						select: { id: true, userName: true, avatarUrl: true },
					},
				},
			}),
			prisma.reviews.count({ where }),
		]);

		return {
			reviews,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch reviews", error);
	}
}
