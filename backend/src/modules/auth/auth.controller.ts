import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthRequest } from "../../types";
import { LoginInput } from "./auth.types";

export async function getMe(req: AuthRequest, res: Response) {
	try {
		const user = req.user;

		if (!user) {
			return res.status(401).json({ error: "unauthorized" });
		}

		const data = await authService.getUserById(user.userId);

		return res.status(200).json(data);
	} catch {
		return res.status(500).json("error");
	}
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