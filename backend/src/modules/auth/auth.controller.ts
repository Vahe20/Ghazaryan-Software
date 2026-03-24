import type { Request, Response } from "express";
import passport from "passport";
import * as authService from "./auth.service.js";
import { updateUserAvatar } from "./avatar.service.js";
import type { AuthRequest } from "../../types/index.js";
import type {
	LoginInput,
	ChangePasswordInput,
} from "./auth.types.js";
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

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: env.COOKIE_SAME_SITE,
	secure: env.COOKIE_SECURE,
	maxAge: env.SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req: Request, res: Response) => {
	const { accessToken, refreshToken, user } = await authService.loginUser(req.body as LoginInput);
	res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
	return res.json({ accessToken, user });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
	const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
	if (!token) {
		throw ApiError.unauthorized("Refresh token missing");
	}
	const result = await authService.refreshToken(token);
	res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
	return res.json({ accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
	const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
	if (token) {
		try {
			await authService.logoutUser(token);
		} catch {
			// session may have already been deleted — still clear the cookie
		}
	}
	res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: env.COOKIE_SAME_SITE, secure: env.COOKIE_SECURE });
	return res.json({ message: "Logged out successfully" });
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
				const { accessToken, refreshToken } = await authService.generateAuthTokens(
user.id,
user.role
);
res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
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




