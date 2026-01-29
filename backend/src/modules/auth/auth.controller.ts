import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response) {
	try {
		const user = await authService.registerUser(req.body);
		res.status(201).json({
			id: user.id,
			email: user.email,
			username: user.userName,
		});
	} catch (error) {
		console.error("Error registering user:", error);
		const message =
			error instanceof Error ? error.message : "Failed to register user";
		res.status(400).json({ error: message });
	}
}

export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body;
		const result = await authService.loginUser(email, password);
		res.json(result);
	} catch (error) {
		console.error("Error logging in:", error);
		const message =
			error instanceof Error ? error.message : "Failed to login";
		res.status(401).json({ error: message });
	}
}

export async function refresh(req: Request, res: Response) {
	try {
		const { refreshToken } = req.body;
		const result = await authService.refreshAccessToken(refreshToken);
		res.json(result);
	} catch (error) {
		console.error("Error refreshing token:", error);
		const message =
			error instanceof Error ? error.message : "Failed to refresh token";
		res.status(401).json({ error: message });
	}
}

export async function logout(req: Request, res: Response) {
	try {
		const { refreshToken } = req.body;
		await authService.logoutUser(refreshToken);
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error logging out:", error);
		const message =
			error instanceof Error ? error.message : "Failed to logout";
		res.status(400).json({ error: message });
	}
}
