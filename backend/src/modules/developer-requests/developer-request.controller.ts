import type { Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";
import { createDeveloperRequestSchema, reviewDeveloperRequestSchema } from "./developer-request.types.js";
import * as service from "./developer-request.service.js";

export const submitRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	const data = createDeveloperRequestSchema.parse(req.body);
	const request = await service.submitRequest(req.user.userId, data);
	res.status(201).json(request);
});

export const getMyRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	const request = await service.getMyRequest(req.user.userId);
	res.json(request);
});

export const listRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
	const status = typeof req.query.status === "string" ? req.query.status : undefined;
	const requests = await service.listRequests(status);
	res.json(requests);
});

export const reviewRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = reviewDeveloperRequestSchema.parse(req.body);
	const request = await service.reviewRequest(req.params.requestId, data.status);
	res.json(request);
});
