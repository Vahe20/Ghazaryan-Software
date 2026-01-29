// Global types and interfaces
import { Request } from "express";

// User types
export type UserRole = "ADMIN" | "USER" | "DEVELOPER";

// App types
export type AppStatus = "BETA" | "RELEASE";
export type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";

// Request types
export interface AuthRequest extends Request {
	user?: {
		userId: string;
		role: UserRole;
	};
	file?: Express.Multer.File;
}

// Pagination types
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

// Query types
export interface SortParams {
	sortBy: string;
	order: "asc" | "desc";
}

// Download metadata
export interface DownloadMetadata {
	version: string;
	platform: Platform;
	ipAddress?: string;
	userAgent?: string;
	country?: string;
}

// Error response
export interface ErrorResponse {
	error: string;
	details?: any;
}

// Success response
export interface SuccessResponse {
	message: string;
	data?: any;
}
