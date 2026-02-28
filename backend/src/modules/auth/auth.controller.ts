import type { Request, Response } from "express";
import passport from "passport";
import * as authService from "./auth.service.js";
import { updateUserAvatar } from "./avatar.service.js";
import type { AuthRequest } from "../../types/index.js";
import type { LoginInput, ChangePasswordInput } from "./auth.types.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";
import env from "../../config/env.js";

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

export const updateAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) throw ApiError.unauthorized("Authentication required");
	if (!req.file) throw ApiError.badRequest("Avatar file is required");

	const avatarUrl = `/uploads/avatar/${req.file.filename}`;
	const result = await updateUserAvatar(req.user.userId, avatarUrl);
	res.json(result);
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

export const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
	session: false,
});

export const googleAuthCallback = (req: Request, res: Response) => {
	passport.authenticate(
		"google",
		{ session: false },
		async (err: any, user: any) => {
			if (err) {
				return res.redirect(
					`${env.FRONTEND_URL}/auth?error=authentication_failed`
				);
			}

			if (!user) {
				return res.redirect(
					`${env.FRONTEND_URL}/auth?error=user_not_found`
				);
			}

			try {
				const accessToken = authService.generateAuthToken(
					user.id,
					user.role
				);

				return res.redirect(
					`${env.FRONTEND_URL}/auth/callback?token=${accessToken}`
				);
			} catch (error) {
				return res.redirect(
					`${env.FRONTEND_URL}/auth?error=token_generation_failed`
				);
			}
		}
	)(req, res);
};

