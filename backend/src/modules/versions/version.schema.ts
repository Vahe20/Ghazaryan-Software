import { z } from "zod";

// Create app version schema
export const createAppVersionSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z (e.g., 1.0.0)"),
	changelog: z
		.string()
		.min(10, "Changelog must be at least 10 characters")
		.max(5000, "Changelog must be at most 5000 characters"),
	downloadUrl: z.string().url("Invalid download URL"),
	size: z.number().int().positive("Size must be a positive number"),
	isStable: z.boolean().default(true),
});

// Update app version schema
export const updateAppVersionSchema = z.object({
	changelog: z
		.string()
		.min(10, "Changelog must be at least 10 characters")
		.max(5000, "Changelog must be at most 5000 characters")
		.optional(),
	downloadUrl: z.string().url("Invalid download URL").optional(),
	size: z.number().int().positive("Size must be a positive number").optional(),
	isStable: z.boolean().optional(),
});

// Query params schema
export const getVersionsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	appId: z.string().uuid("Invalid app ID"),
	isStable: z.coerce.boolean().optional(),
	sortBy: z.enum(["releaseDate", "version"]).default("releaseDate"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

// Types
export type CreateAppVersionInput = z.infer<typeof createAppVersionSchema>;
export type UpdateAppVersionInput = z.infer<typeof updateAppVersionSchema>;
export type GetVersionsQuery = z.infer<typeof getVersionsQuerySchema>;
