import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../types";
import { LoginInput } from "./auth.types";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ApiError } from "../../utils/errors";

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const data = await authService.getUserById(req.user.userId);
	return res.json(data);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
	const user = await authService.registerUser(req.body);

	return res.status(201).json({
		id: user.id,
		email: user.email,
		username: user.userName,
	});
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const result = await authService.loginUser(req.body as LoginInput);
	return res.json(result);
});
