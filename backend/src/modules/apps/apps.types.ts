import { z } from "zod";
import type { AppStatus, Platform, SortParams } from "../../types/index.js";

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
	sourceUrl: z.string().url("Invalid source URL").or(z.literal("")).optional(),
	documentationUrl: z.string().url("Invalid documentation URL").or(z.literal("")).optional(),
	status: appStatusSchema.default("BETA"),
	price: z.number().min(0, "Price must be 0 or greater").default(0),
	authorId: z.string().uuid("Invalid author ID").optional(),
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
	sourceUrl: z.string().url("Invalid source URL").or(z.literal("")).optional(),
	documentationUrl: z.string().url("Invalid documentation URL").or(z.literal("")).optional(),
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

export const createAppVersionSchema = z.object({
	version: z.string().min(1, "Version is required").max(50, "Version is too long"),
	changelog: z.string().max(10000, "Changelog is too long").optional(),
	status: appStatusSchema.default("BETA"),
	downloadUrl: z.string().url("Invalid download URL"),
});

export const updateAppVersionSchema = z.object({
	version: z.string().min(1, "Version is required").max(50, "Version is too long").optional(),
	changelog: z.string().max(10000, "Changelog is too long").optional(),
	status: appStatusSchema.optional(),
});

export const getVersionsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	appId: z.string().uuid("Invalid app ID"),
	status: appStatusSchema.optional(),
	sortBy: z.enum(["releaseDate"]).default("releaseDate"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;
export type GetAppsQuery = z.infer<typeof getAppsQuerySchema>;
export type CreateAppVersionInput = z.infer<typeof createAppVersionSchema>;
export type UpdateAppVersionInput = z.infer<typeof updateAppVersionSchema>;
export type GetVersionsQuery = z.infer<typeof getVersionsQuerySchema>;

export interface AppWithRelations {
	id: string;
	name: string;
	slug: string;
	shortDesc: string;
	description: string;
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

export interface AppVersion {
	id: string;
	appId: string;
	version: string;
	changelog?: string | null;
	status: AppStatus;
	releaseDate: Date;
}

export interface CreateVersionData {
	version: string;
	changelog?: string;
	status?: AppStatus;
	downloadUrl: string;
}

export interface AppFilters {
	search?: string | undefined;
	categoryId?: string | undefined;
	status?: AppStatus | undefined;
	platform?: Platform | undefined;
}

export interface AppSortOptions extends SortParams {
	sortBy: "createdAt" | "updatedAt" | "downloadCount" | "rating" | "name" | "purchasedAt";
}
