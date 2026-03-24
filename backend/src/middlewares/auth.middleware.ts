import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import type { UserRole } from "../generated/prisma/index.js";

type AuthTokenPayload = jwt.JwtPayload & {
	userId: string;
	role: UserRole;
};

const isAuthTokenPayload = (
	payload: string | jwt.JwtPayload,
): payload is AuthTokenPayload => {
	if (typeof payload !== "object" || payload === null) {
		return false;
	}

	return (
		typeof payload.userId === "string" &&
		typeof payload.role === "string"
	);
};

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

		if (!config.JWT_ACCESS_SECRET) {
			return res.status(500).json({
				error: {
					code: "INTERNAL_ERROR",
					message: "JWT access secret is not configured",
				},
			});
		}

		const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

		if (!isAuthTokenPayload(decoded)) {
			return res.status(401).json({
				error: {
					code: "INVALID_TOKEN",
					message: "Invalid token payload",
				},
			});
		}

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

