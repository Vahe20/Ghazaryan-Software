import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env";
import { AuthRequest } from "../types";

const authMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No token provided" });
		}

		req.user = jwt.verify(token, config.JWT_ACCESS_SECRET) as any;

		next();
	} catch {
		return res.status(401).json({ error: "Invalid token" });
	}
};

export default authMiddleware;
