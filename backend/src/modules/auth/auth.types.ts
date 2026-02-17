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
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email format").max(100, "Email must be at most 100 characters"),
	password: z.string().min(8, "Password is required").max(100, "Password must be at most 100 characters")
});

export const updateUserSchema = z.object({
	email: z.string().email("Invalid email format").optional(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be at most 50 characters")
		.regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens")
		.optional(),
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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface UserCreateData {
	email: string;
	userName: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	user: {
		id: string;
		email: string;
		role: UserRole;
	};
}
