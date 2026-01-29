import { z } from "zod";

export const createAppVersionSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z (e.g., 1.0.0)"),
	changelog: z
		.string()
		.min(10, "Changelog must be at least 10 characters")
		.max(5000, "Changelog must be at most 5000 characters"),
	isStable: z.boolean().default(true),
});

export const updateAppVersionSchema = z.object({
	changelog: z
		.string()
		.min(10, "Changelog must be at least 10 characters")
		.max(5000, "Changelog must be at most 5000 characters")
		.optional(),
	isStable: z.boolean().optional(),
});

export const getVersionsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	appId: z.string().uuid("Invalid app ID"),
	isStable: z.coerce.boolean().optional(),
	sortBy: z.enum(["releaseDate", "version"]).default("releaseDate"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAppVersionInput = z.infer<typeof createAppVersionSchema>;
export type UpdateAppVersionInput = z.infer<typeof updateAppVersionSchema>;
export type GetVersionsQuery = z.infer<typeof getVersionsQuerySchema>;

export interface AppVersion {
	id: string;
	appId: string;
	version: string;
	changelog: string;
	downloadUrl: string;
	size: number;
	isStable: boolean;
	releaseDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateVersionData {
	appId: string;
	version: string;
	changelog: string;
	isStable: boolean;
	downloadUrl: string;
	size: number;
}
