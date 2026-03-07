import { z } from "zod";

export const linkEditionSchema = z.object({
	editionAppId: z.string().uuid("Invalid edition app ID"),
});

export const createEditionSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z.string().min(1).max(100).optional(),
	shortDesc: z.string().max(200).optional(),
	price: z.number().min(0),
	status: z.enum(["BETA", "RELEASE"]).optional(),
});

export const updateEditionSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	slug: z.string().min(1).max(100).optional(),
	shortDesc: z.string().max(200).optional(),
	price: z.number().min(0).optional(),
	status: z.enum(["BETA", "RELEASE"]).optional(),
});

export type LinkEditionInput = z.infer<typeof linkEditionSchema>;
export type CreateEditionInput = z.infer<typeof createEditionSchema>;
export type UpdateEditionInput = z.infer<typeof updateEditionSchema>;
