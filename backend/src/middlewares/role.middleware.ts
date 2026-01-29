import { UserRole, AuthRequest } from "../types";
import { Response, NextFunction } from "express";

export function requireRole(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	};
}
