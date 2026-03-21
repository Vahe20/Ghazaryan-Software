import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import type { UserRole } from "../generated/prisma/index.js";

const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				error: {
					code: "UNAUTHORIZED",
					message: "No token provided",
				},
			});
		}

		const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as { userId: string; role: UserRole };
		req.user = {
			userId: decoded.userId,
			role: decoded.role,
		};

		next();
	} catch {
		return res.status(401).json({
			error: {
				code: "INVALID_TOKEN",
				message: "Invalid token",
			},
		});
	}
};

export default authMiddleware;

