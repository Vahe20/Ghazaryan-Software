import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../types";
import { LoginInput } from "./auth.types";

export async function getMe(req: AuthRequest, res: Response) {
	const user = req.user;

	if (!user) {
		return res.status(401).json({ error: "unauthorized" });
	}

	const data = await authService.getUserById(user.userId);

	return res.status(200).json(data);
}

export async function register(req: Request, res: Response) {
	try {
		const user = await authService.registerUser(req.body);

		return res.status(201).json({
			id: user.id,
			email: user.email,
			username: user.userName,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to register user";

		return res.status(400).json({ error: message });
	}
}

export async function login(req: Request, res: Response) {
	try {
		const result = await authService.loginUser(req.body as LoginInput);

		return res.json(result);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to login";

		return res.status(401).json({ error: message });
	}
}

export async function refresh(req: Request, res: Response) {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ error: "refreshToken required" });
		}

		const result = await authService.refreshAccessToken(refreshToken);

		return res.json(result);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to refresh token";

		return res.status(401).json({ error: message });
	}
}

export async function logout(req: Request, res: Response) {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ error: "refreshToken required" });
		}

		await authService.logoutUser(refreshToken);

		return res.json({ message: "Logged out successfully" });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to logout";

		return res.status(401).json({ error: message });
	}
}
