import { Axios } from "../config/Axios";
import { App } from "../types/Entities";

export type UserRole = "USER" | "DEVELOPER" | "ADMIN";
export type PurchaseStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";

export interface AdminUser {
	id: string;
	email: string;
	userName: string;
	role: UserRole;
	balance: number;
	avatarUrl?: string;
	createdAt: string;
	lastLoginAt?: string | null;
	isBanned: boolean;
	bannedUntil?: string | null;
	banReason?: string | null;
	_count: {
		purchases: number;
		downloads: number;
		reviews: number;
	};
}

export interface UserPurchase {
	id: string;
	appId: string;
	price: number;
	status: PurchaseStatus;
	purchasedAt: string;
	paymentMethod?: string | null;
	app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface UserDownload {
	id: string;
	version: string;
	platform: Platform;
	downloadedAt: string;
	app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface UserReview {
	id: string;
	rating: number;
	title?: string | null;
	comment: string;
	createdAt: string;
	app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface Purchase {
	id: string;
	userId: string;
	appId: string;
	price: number;
	paymentMethod?: string | null;
	transactionId?: string | null;
	status: PurchaseStatus;
	purchasedAt: string;
	expiresAt?: string | null;
	user: {
		id: string;
		userName: string;
		email: string;
		avatarUrl?: string | null;
	};
	app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface DashboardStats {
	overview: {
		totalUsers: number;
		totalApps: number;
		totalPurchases: number;
		totalRevenue: number;
		recentUsers: number;
		recentPurchases: number;
	};
	changes: {
		userChange: number;
		purchaseChange: number;
		revenueChange: number;
		appChange: number;
	};
	topApps: Array<{
		id: string;
		name: string;
		slug: string;
		iconUrl: string;
		downloadCount: number;
		rating: number;
		price: number;
	}>;
}

export interface Activity {
	type: "user_registered" | "purchase_completed" | "app_published";
	timestamp: string;
	description: string;
	data: Record<string, unknown>;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

function buildQuery(
	params: Record<string, string | number | undefined>,
): string {
	const q = new URLSearchParams();
	for (const [key, val] of Object.entries(params)) {
		if (val !== undefined && val !== "") q.append(key, String(val));
	}
	const s = q.toString();
	return s ? "?" + s : "";
}

export const AdminService = {
	getDashboardStats: () =>
		Axios.get<DashboardStats>("/admin/stats").then(r => r.data),

	getRecentActivity: () =>
		Axios.get<Activity[]>("/admin/activity").then(r => r.data),

	getUsers: (params?: {
		page?: number;
		limit?: number;
		search?: string;
		role?: string;
	}) =>
		Axios.get<{ users: AdminUser[]; pagination: Pagination }>(
			`/admin/users${buildQuery(params ?? {})}`,
		).then(r => r.data),

	getUserById: (userId: string) =>
		Axios.get<AdminUser>(`/admin/users/${userId}`).then(r => r.data),

	getUserPurchases: (
		userId: string,
		params?: { page?: number; limit?: number },
	) =>
		Axios.get<{ purchases: UserPurchase[]; pagination: Pagination }>(
			`/admin/users/${userId}/purchases${buildQuery(params ?? {})}`,
		).then(r => r.data),

	getUserDownloads: (
		userId: string,
		params?: { page?: number; limit?: number },
	) =>
		Axios.get<{ downloads: UserDownload[]; pagination: Pagination }>(
			`/admin/users/${userId}/downloads${buildQuery(params ?? {})}`,
		).then(r => r.data),

	getUserReviews: (
		userId: string,
		params?: { page?: number; limit?: number },
	) =>
		Axios.get<{ reviews: UserReview[]; pagination: Pagination }>(
			`/admin/users/${userId}/reviews${buildQuery(params ?? {})}`,
		).then(r => r.data),

	updateUserRole: (userId: string, role: UserRole) =>
		Axios.patch<AdminUser>(`/admin/users/${userId}/role`, { role }).then(
			r => r.data,
		),

	banUser: (
		userId: string,
		data: { reason?: string; until?: string | null },
	) =>
		Axios.patch<AdminUser>(`/admin/users/${userId}/ban`, data).then(
			r => r.data,
		),

	unbanUser: (userId: string) =>
		Axios.patch<AdminUser>(`/admin/users/${userId}/unban`, {}).then(
			r => r.data,
		),

	deleteUser: (userId: string) =>
		Axios.delete<AdminUser>(`/admin/users/${userId}`).then(r => r.data),

	getPurchases: (params?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
	}) =>
		Axios.get<{ purchases: Purchase[]; pagination: Pagination }>(
			`/admin/purchases${buildQuery(params ?? {})}`,
		).then(r => r.data),

	getApps: (params?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		categoryId?: string;
	}) =>
		Axios.get<{ apps: App[]; pagination: Pagination }>(
			`/apps${buildQuery(params ?? {})}`,
		).then(r => r.data),

	createApp: (data: Partial<App>) =>
		Axios.post<App>("/apps", data).then(r => r.data),

	updateApp: (id: string, data: Partial<App>) =>
		Axios.put<App>(`/apps/${id}`, data).then(r => r.data),

	deleteApp: (id: string) => Axios.delete(`/apps/${id}`).then(r => r.data),

	getCategories: () =>
		Axios.get<
			{
				id: string;
				name: string;
				slug: string;
				description?: string;
				order: number;
			}[]
		>("/categories").then(r => r.data),

	createCategory: (data: {
		name: string;
		description?: string;
		order?: number;
	}) => Axios.post("/categories", data).then(r => r.data),

	updateCategory: (
		id: string,
		data: { name?: string; description?: string; order?: number },
	) => Axios.put(`/categories/${id}`, data).then(r => r.data),

	deleteCategory: (id: string) =>
		Axios.delete(`/categories/${id}`).then(r => r.data),
};
