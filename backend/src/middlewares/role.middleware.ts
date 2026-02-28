import type { Response, NextFunction } from "express";
import type { UserRole, AuthRequest } from "../types/index.js";

export function requireRole(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	};
}
