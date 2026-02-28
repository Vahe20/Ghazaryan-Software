import type { Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";
import * as paymentService from "./payment.service.js";

export const topUpBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { amount } = req.body;

	const result = await paymentService.topUpBalance(req.user.userId, amount);

	return res.json({
		message: "Balance topped up successfully",
		balance: result.balance,
	});
});

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
