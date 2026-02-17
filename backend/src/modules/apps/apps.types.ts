import { z } from "zod";
import { AppStatus, Platform, SortParams } from "../../types";

export const appStatusSchema = z.enum(["BETA", "RELEASE"]);
export const platformSchema = z.enum(["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"]);

export const createAppSchema = z.object({
	name: z
		.string()
		.min(3, "Name must be at least 3 characters")
		.max(100, "Name must be at most 100 characters"),
	slug: z
		.string()
		.min(3, "Slug must be at least 3 characters")
		.max(100, "Slug must be at most 100 characters")
		.regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
		.optional(),
	shortDesc: z
		.string()
		.min(10, "Short description must be at least 10 characters")
		.max(200, "Short description must be at most 200 characters"),
	description: z
		.string()
		.min(50, "Description must be at least 50 characters")
		.max(10000, "Description must be at most 10000 characters"),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z (e.g., 1.0.0)"),
	changelog: z.string().max(5000, "Changelog must be at most 5000 characters").optional(),
	iconUrl: z.string().url("Invalid icon URL"),
	coverUrl: z.string().url("Invalid cover URL").optional(),
	screenshots: z.array(z.string().url("Invalid screenshot URL")).max(10, "Maximum 10 screenshots allowed"),
	categoryId: z.string().uuid("Invalid category ID"),
	tags: z
		.array(z.string().min(2, "Tag must be at least 2 characters").max(30, "Tag must be at most 30 characters"))
		.max(10, "Maximum 10 tags allowed"),
	size: z.number().int().positive("Size must be a positive number"),
	platform: z
		.array(platformSchema)
		.min(1, "At least one platform is required")
		.max(5, "Maximum 5 platforms allowed"),
	minVersion: z.string().optional(),
	downloadUrl: z.string().url("Invalid download URL"),
	sourceUrl: z.string().url("Invalid source URL").optional(),
	documentationUrl: z.string().url("Invalid documentation URL").optional(),
	status: appStatusSchema.default("BETA"),
	price: z.number().min(0, "Price must be 0 or greater").default(0),
});

export const updateAppSchema = z.object({
	name: z
		.string()
		.min(3, "Name must be at least 3 characters")
		.max(100, "Name must be at most 100 characters")
		.optional(),
	slug: z
		.string()
		.min(3, "Slug must be at least 3 characters")
		.max(100, "Slug must be at most 100 characters")
		.regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
		.optional(),
	shortDesc: z
		.string()
		.min(10, "Short description must be at least 10 characters")
		.max(200, "Short description must be at most 200 characters")
		.optional(),
	description: z
		.string()
		.min(50, "Description must be at least 50 characters")
		.max(10000, "Description must be at most 10000 characters")
		.optional(),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z (e.g., 1.0.0)").optional(),
	changelog: z.string().max(5000, "Changelog must be at most 5000 characters").optional(),
	iconUrl: z.string().url("Invalid icon URL").optional(),
	coverUrl: z.string().url("Invalid cover URL").optional(),
	screenshots: z.array(z.string().url("Invalid screenshot URL")).max(10, "Maximum 10 screenshots allowed").optional(),
	categoryId: z.string().uuid("Invalid category ID").optional(),
	tags: z
		.array(z.string().min(2, "Tag must be at least 2 characters").max(30, "Tag must be at most 30 characters"))
		.max(10, "Maximum 10 tags allowed")
		.optional(),
	size: z.number().int().positive("Size must be a positive number").optional(),
	platform: z
		.array(platformSchema)
		.min(1, "At least one platform is required")
		.max(5, "Maximum 5 platforms allowed")
		.optional(),
	minVersion: z.string().optional(),
	downloadUrl: z.string().url("Invalid download URL").optional(),
	sourceUrl: z.string().url("Invalid source URL").optional(),
	documentationUrl: z.string().url("Invalid documentation URL").optional(),
	status: appStatusSchema.optional(),
	price: z.number().min(0, "Price must be 0 or greater").optional(),
});

export const getAppsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().optional(),
	categoryId: z.string().uuid().optional(),
	status: appStatusSchema.optional(),
	platform: platformSchema.optional(),
	sortBy: z.enum(["createdAt", "updatedAt", "downloadCount", "rating", "name", "purchasedAt"]).default("createdAt"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type GetAppsQuery = z.infer<typeof getAppsQuerySchema>;

export interface AppWithRelations {
	id: string;
	name: string;
	slug: string;
	shortDesc: string;
	description: string;
	version: string;
	iconUrl: string;
	coverUrl?: string | null;
	rating: number;
	downloadCount: number;
	viewCount: number;
	category: {
		id: string;
		name: string;
		slug: string;
	};
	_count: {
		reviews: number;
		downloads: number;
	};
}

export interface AppFilters {
	search?: string;
	categoryId?: string;
	status?: AppStatus;
	platform?: Platform;
}

export interface AppSortOptions extends SortParams {
	sortBy: "createdAt" | "updatedAt" | "downloadCount" | "rating" | "name" | "purchasedAt";
}
