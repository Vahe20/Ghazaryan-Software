import { z } from "zod";

export const createEditionSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(2000).optional(),
	price: z.number().min(0),
	downloadUrl: z.string().url(),
	features: z.array(z.string().max(200)).max(20).default([]),
	isDefault: z.boolean().default(false),
	isActive: z.boolean().default(true),
});

export const updateEditionSchema = createEditionSchema.partial();

export type CreateEditionInput = z.infer<typeof createEditionSchema>;
export type UpdateEditionInput = z.infer<typeof updateEditionSchema>;
