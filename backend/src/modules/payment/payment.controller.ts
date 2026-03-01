import type { Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";
import * as paymentService from "./payment.service.js";
import type { Request } from "express";
import stripe from "../../config/stripe.js";
import env from "../../config/env.js";

export const purchaseApp = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { appId } = req.body;

	const result = await paymentService.purchaseApp(req.user.userId, appId);

	return res.status(201).json({
		message: "Purchase successful",
		purchase: result.purchase,
		balance: result.balance,
	});
});

export const getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const history = await paymentService.getPaymentHistory(req.user.userId);

	return res.json(history);
});

export const createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { amount } = req.body;

	const session = await paymentService.createCheckoutSession(req.user.userId, amount);

	return res.json({
		sessionId: session.sessionId,
		url: session.url,
	});
});

export const createAppPurchaseSession = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { appId } = req.body;

	const session = await paymentService.createAppPurchaseSession(req.user.userId, appId);

	return res.json({
		sessionId: session.sessionId,
		url: session.url,
	});
});

export const handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
	const sig = req.headers["stripe-signature"];

	if (!sig) {
		throw ApiError.badRequest("Missing stripe signature");
	}

	if (!env.STRIPE_WEBHOOK_SECRET) {
		throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig,
			env.STRIPE_WEBHOOK_SECRET,
		);
	} catch (err) {
		const error = err as Error;
		throw ApiError.badRequest(`Webhook signature verification failed: ${error.message}`);
	}

	await paymentService.handleWebhookEvent(event);

	return res.json({ received: true });
});
