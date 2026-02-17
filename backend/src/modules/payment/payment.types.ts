import { z } from "zod";

export const topUpSchema = z.object({
	amount: z
		.number({ required_error: "Amount is required" })
		.positive("Amount must be positive")
		.max(10000, "Amount cannot exceed $10,000 per transaction"),
});

export const purchaseAppSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
export type PurchaseAppInput = z.infer<typeof purchaseAppSchema>;
