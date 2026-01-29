import { z } from "zod";
import { platformSchema } from "../apps/apps.types";

export const createDownloadSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
	version: z
		.string()
		.regex(
			/^\d+\.\d+\.\d+$/,
			"Version must be in format X.Y.Z (e.g., 1.0.0)",
		),
	platform: platformSchema,
	// ipAddress: z.string().ip("Invalid IP address").optional(),
	userAgent: z
		.string()
		.max(500, "User agent must be at most 500 characters")
		.optional(),
	country: z
		.string()
		.length(2, "Country code must be 2 characters")
		.optional(),
});

export const getDownloadsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	appId: z.string().uuid("Invalid app ID").optional(),
	userId: z.string().uuid("Invalid user ID").optional(),
	platform: platformSchema.optional(),
	country: z
		.string()
		.length(2, "Country code must be 2 characters")
		.optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	sortBy: z.enum(["downloadedAt"]).default("downloadedAt"),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export const getDownloadStatsSchema = z.object({
	appId: z.string().uuid("Invalid app ID").optional(),
	groupBy: z
		.enum(["day", "week", "month", "platform", "country"])
		.default("day"),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});

export type CreateDownloadInput = z.infer<typeof createDownloadSchema>;
export type GetDownloadsQuery = z.infer<typeof getDownloadsQuerySchema>;
export type GetDownloadStatsInput = z.infer<typeof getDownloadStatsSchema>;
