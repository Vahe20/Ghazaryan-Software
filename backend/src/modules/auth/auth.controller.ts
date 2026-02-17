import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../types";
import { LoginInput, ChangePasswordInput } from "./auth.types";
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

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { currentPassword, newPassword } = req.body as ChangePasswordInput;
	await authService.changeUserPassword(req.user.userId, currentPassword, newPassword);

	return res.json({ message: "Password changed successfully" });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const { password } = req.body;

	if (!password) {
		throw ApiError.badRequest("Password is required to delete account");
	}

	await authService.deleteUserAccount(req.user.userId, password);

	return res.json({ message: "Account deleted successfully" });
});

