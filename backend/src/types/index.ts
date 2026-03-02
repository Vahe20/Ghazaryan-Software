import type { Request } from "express";

declare global {
	namespace Express {
		interface User {
			userId: string;
			role: UserRole;
		}
	}
}

export type UserRole = "ADMIN" | "USER" | "DEVELOPER";


export type AppStatus = "BETA" | "RELEASE";
export type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";


export interface AuthRequest extends Request {
	user?: Express.User;
	file?: Express.Multer.File;
}


export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginationResult {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationResult;
}


export interface SortParams {
	sortBy: string;
	order: "asc" | "desc";
}


export interface DownloadMetadata {
	version: string;
	platform: Platform;
	ipAddress?: string | undefined;
	userAgent?: string | undefined;
	country?: string | undefined;
}


export interface ErrorResponse {
	error: string;
	details?: unknown;
}


export interface SuccessResponse {
	message: string;
	data?: unknown;
}
