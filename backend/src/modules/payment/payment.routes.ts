import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { topUpSchema, purchaseAppSchema } from "./payment.types.js";
import { writeLimiter, readLimiter } from "../../middlewares/rateLimit/index.js";

const router = Router();

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
