import { z } from "zod";

export const createReviewSchema = z.object({
	rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
	title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters").optional(),
	comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be at most 1000 characters"),
});

export const updateReviewSchema = z.object({
	rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
	title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters").optional(),
	comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment must be at most 1000 characters").optional(),
});

export const getReviewsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	appId: z.string().uuid("Invalid app ID").optional(),
	userId: z.string().uuid("Invalid user ID").optional(),
	rating: z.coerce.number().int().min(1).max(5).optional(),
	sortBy: z.enum(["createdAt", "updatedAt", "rating", "helpful"]).default("createdAt"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export const markHelpfulSchema = z.object({
	reviewId: z.string().uuid("Invalid review ID"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
export type MarkHelpfulInput = z.infer<typeof markHelpfulSchema>;

export interface Review {
	id: string;
	appId: string;
	userId: string;
	rating: number;
	title?: string | null;
	comment: string;
	helpful: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateReviewData {
	rating: number;
	comment: string;
	title?: string;
}

export interface UpdateReviewData {
	rating?: number;
	comment?: string;
	title?: string;
}
