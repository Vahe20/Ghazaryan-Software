import type { Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import * as adminService from "./admin.service.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";

export const getUsers = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { page, limit, search, role } = req.query;
		const data = await adminService.getUsers();
		return res.json(data);
	},
);

export const getUserById = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.getUserById(id);
		return res.json(data);
	},
);

export const updateUserRole = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { role } = req.body;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.updateUserRole(id, role);
		return res.json(data);
	},
);

export const banUser = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;
	const { reason, until } = req.body as {
		reason?: string;
		until?: string | null;
	};

	if (!id || Array.isArray(id))
		throw ApiError.badRequest("Invalid user ID");

	const data = await adminService.banUser(id, { reason, until });
	return res.json(data);
});

export const unbanUser = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.unbanUser(id);
		return res.json(data);
	},
);

export const deleteUser = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.deleteUser(id);
		return res.json(data);
	},
);

export const getUserPurchases = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { page, limit } = req.query;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.getUserPurchases(id, {
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
		});
		return res.json(data);
	},
);

export const getUserDownloads = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { page, limit } = req.query;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.getUserDownloads(id, {
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
		});
		return res.json(data);
	},
);

export const getUserReviews = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { id } = req.params;
		const { page, limit } = req.query;

		if (!id || Array.isArray(id))
			throw ApiError.badRequest("Invalid user ID");

		const data = await adminService.getUserReviews(id, {
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
		});
		return res.json(data);
	},
);

export const getPurchases = asyncHandler(
	async (req: AuthRequest, res: Response) => {
		const { page, limit, userId, appId, status } = req.query;
		const data = await adminService.getPurchases({
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
			userId: userId as string | undefined,
			appId: appId as string | undefined,
			status: status as string | undefined,
		});
		return res.json(data);
	},
);

export const getDashboardStats = asyncHandler(
	async (_req: AuthRequest, res: Response) => {
		const data = await adminService.getDashboardStats();
		return res.json(data);
	},
);

export const getRecentActivity = asyncHandler(
	async (_req: AuthRequest, res: Response) => {
		const data = await adminService.getRecentActivity();
		return res.json(data);
	},
);
