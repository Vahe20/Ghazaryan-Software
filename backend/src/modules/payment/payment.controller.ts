import { Response } from "express";
import { AuthRequest } from "../../types";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ApiError } from "../../utils/errors";
import * as paymentService from "./payment.service";

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

	const purchase = await paymentService.purchaseApp(req.user.userId, appId);

	return res.status(201).json({
		message: "Purchase successful",
		purchase,
	});
});

export const getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const history = await paymentService.getPaymentHistory(req.user.userId);

	return res.json(history);
});
