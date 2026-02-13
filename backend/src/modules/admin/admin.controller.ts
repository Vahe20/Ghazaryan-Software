import { Response } from "express";
import { AuthRequest } from "../../types";
import * as adminService from "./admin.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ApiError } from "../../utils/errors";

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { page, limit, search, role } = req.query;

	const data = await adminService.getUsers({
		page: page ? Number(page) : undefined,
		limit: limit ? Number(limit) : undefined,
		search: search as string,
		role: role as string,
	});

	return res.json(data);
});

export const getPurchases = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { page, limit, userId, appId, status } = req.query;

		const data = await adminService.getPurchases({
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
			userId: userId as string,
			appId: appId as string,
			status: status as string,
		});

		return res.json(data);
	},
);

export const getDashboardStats = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const data = await adminService.getDashboardStats();

		return res.json(data);
	},
);

export const getRecentActivity = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const data = await adminService.getRecentActivity();

		return res.json(data);
	},
);
