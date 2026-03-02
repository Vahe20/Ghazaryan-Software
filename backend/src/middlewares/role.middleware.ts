import type { Response, NextFunction } from "express";
import type { UserRole, AuthRequest } from "../types/index.js";
import { ApiError } from "../utils/errors.js";

export function requireRole(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			throw ApiError.unauthorized("Authentication required");
		}

		if (!roles.includes(req.user.role)) {
			throw ApiError.forbidden(
				`Access denied. Required role: ${roles.join(" or ")}`,
			);
		}

		next();
	};
}

export function requireAnyRole(...roles: UserRole[]) {
	return requireRole(...roles);
}

export function requireAllRoles(...roles: UserRole[]) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			throw ApiError.unauthorized("Authentication required");
		}

		const hasAllRoles = roles.every((role) => req.user?.role === role);

		if (!hasAllRoles) {
			throw ApiError.forbidden(
				`Access denied. All required roles: ${roles.join(", ")}`,
			);
		}

		next();
	};
}

export function requireAdmin() {
	return requireRole("ADMIN");
}

export function requireDeveloper() {
	return requireRole("DEVELOPER", "ADMIN");
}

export function requireUser() {
	return requireRole("USER", "DEVELOPER", "ADMIN");
}
