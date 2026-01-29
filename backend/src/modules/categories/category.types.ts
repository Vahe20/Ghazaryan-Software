import { z } from "zod";

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(2, "Category name must be at least 2 characters")
		.max(50, "Category name must be at most 50 characters"),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional(),
	order: z
		.number()
		.int()
		.nonnegative("Order must be a non-negative number")
		.default(0),
});

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(2, "Category name must be at least 2 characters")
		.max(50, "Category name must be at most 50 characters")
		.optional(),
	slug: z
		.string()
		.min(2, "Slug must be at least 2 characters")
		.max(50, "Slug must be at most 50 characters")
		.regex(
			/^[a-z0-9-]+$/,
			"Slug can only contain lowercase letters, numbers and hyphens",
		)
		.optional(),
	description: z
		.string()
		.max(500, "Description must be at most 500 characters")
		.optional(),
	order: z
		.number()
		.int()
		.nonnegative("Order must be a non-negative number")
		.optional(),
});

export const getCategoriesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().optional(),
	sortBy: z.enum(["name", "order", "createdAt"]).default("order"),
	order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	order: number;
	createdAt: Date;
	updatedAt: Date;
}
