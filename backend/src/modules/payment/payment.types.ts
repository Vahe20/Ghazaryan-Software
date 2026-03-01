import { z } from "zod";

export const purchaseAppSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
});

export const createCheckoutSessionSchema = z.object({
	amount: z
		.number({ error: "Amount must be a number" })
		.positive("Amount must be positive")
		.min(1, "Minimum amount is $1")
		.max(10000, "Amount cannot exceed $10,000 per transaction"),
});

export const purchaseAppWithStripeSchema = z.object({
	appId: z.string().uuid("Invalid app ID"),
});

export type PurchaseAppInput = z.infer<typeof purchaseAppSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type PurchaseAppWithStripeInput = z.infer<typeof purchaseAppWithStripeSchema>;
