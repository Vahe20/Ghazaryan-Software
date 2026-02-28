import { z } from "zod";

export const createPromotionSchema = z.object({
	editionId: z.string().uuid().optional(),
	discountAmount: z.number().positive().optional(),
	discountPercent: z.number().int().min(1).max(100).optional(),
	label: z.string().max(100).optional(),
	startsAt: z.coerce.date(),
	endsAt: z.coerce.date(),
	isActive: z.boolean().default(true),
}).refine(d => d.discountAmount || d.discountPercent, {
	message: "Either discountAmount or discountPercent is required",
}).refine(d => d.startsAt < d.endsAt, {
	message: "endsAt must be after startsAt",
});

export const updatePromotionSchema = z.object({
	discountAmount: z.number().positive().optional(),
	discountPercent: z.number().int().min(1).max(100).optional(),
	label: z.string().max(100).optional(),
	startsAt: z.coerce.date().optional(),
	endsAt: z.coerce.date().optional(),
	isActive: z.boolean().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
