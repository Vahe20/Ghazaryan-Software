import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
	purchaseAppSchema,
	createCheckoutSessionSchema,
	purchaseAppWithStripeSchema,
} from "./payment.types.js";
import { writeLimiter, readLimiter } from "../../middlewares/rateLimit/index.js";

const router = Router();

router.use(authMiddleware);

router.post(
	"/checkout/create-session",
	writeLimiter,
	validate(createCheckoutSessionSchema),
	paymentController.createCheckoutSession,
);

router.post(
	"/checkout/purchase-app",
	writeLimiter,
	validate(purchaseAppWithStripeSchema),
	paymentController.createAppPurchaseSession,
);

router.post(
	"/purchase",
	writeLimiter,
	validate(purchaseAppSchema),
	paymentController.purchaseApp,
);

router.get(
	"/history",
	readLimiter,
	paymentController.getPaymentHistory,
);

export default router;
