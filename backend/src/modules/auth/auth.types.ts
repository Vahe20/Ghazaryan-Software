import { z } from "zod";
import { UserRole } from "../../types";

export const userRoleSchema = z.enum(["USER", "DEVELOPER", "ADMIN"]);

export const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	userName: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be at most 50 characters")
		.regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must be at most 100 characters"),
	fullName: z.string().max(100, "Full name must be at most 100 characters").optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(8, "Password is required"),
});

export const updateUserSchema = z.object({
	email: z.string().email("Invalid email format").optional(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be at most 50 characters")
		.regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens")
		.optional(),
	fullName: z.string().max(100, "Full name must be at most 100 characters").optional(),
	avatarUrl: z.string().url("Invalid avatar URL").optional(),
	role: userRoleSchema.optional(),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z
		.string()
		.min(8, "New password must be at least 8 characters")
		.max(100, "New password must be at most 100 characters"),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export interface UserCreateData {
	email: string;
	userName: string;
	password: string;
	fullName?: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		email: string;
		userName: string;
		role: UserRole;
	};
}

export interface RefreshResponse {
	accessToken: string;
	user: {
		id: string;
		email: string;
		userName: string;
		role: UserRole;
	};
}
