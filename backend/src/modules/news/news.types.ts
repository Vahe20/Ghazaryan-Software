import { z } from "zod";

export const tagColorValues = ["BLUE", "PINK", "PURPLE", "GREEN"] as const;

export const createNewsSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().min(1),
	tag: z.string().min(1).max(50),
	tagColor: z.enum(tagColorValues).optional().default("BLUE"),
	coverUrl: z.string().url().optional().nullable(),
	link: z.string().optional().nullable(),
	publishedAt: z.string().datetime().optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
