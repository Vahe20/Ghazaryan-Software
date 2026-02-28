import { z } from "zod";

export const createDeveloperRequestSchema = z.object({
	reason: z.string().min(50, "Reason must be at least 50 characters").max(2000),
	portfolio: z.string().url().optional(),
});

export const reviewDeveloperRequestSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED"]),
});

export type CreateDeveloperRequestInput = z.infer<typeof createDeveloperRequestSchema>;
export type ReviewDeveloperRequestInput = z.infer<typeof reviewDeveloperRequestSchema>;
