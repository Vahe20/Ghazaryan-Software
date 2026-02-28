import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.js";

const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No token provided" });
		}

		const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET as string) as any;
		req.user = {
			userId: decoded.userId,
			role: decoded.role,
		};

		next();
	} catch {
		return res.status(401).json({ error: "Invalid token" });
	}
};

export default authMiddleware;

