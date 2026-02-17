import { Router } from "express";
import * as paymentController from "./payment.controller";
import { validate } from "../../middlewares/validation.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import { topUpSchema, purchaseAppSchema } from "./payment.types";
import { writeLimiter, readLimiter } from "../../middlewares/rateLimit";

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

router.patch(
	"/top-up",
	writeLimiter,
	validate(topUpSchema),
	paymentController.topUpBalance,
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
