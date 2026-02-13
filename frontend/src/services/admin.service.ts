import { Axios } from "../config/Axios";

// Types
export interface User {
	id: string;
	email: string;
	userName: string;
	role: "USER" | "DEVELOPER" | "ADMIN";
	balance: number;
	avatarUrl?: string;
	createdAt: string;
	lastLoginAt?: string;
	_count: {
		purchases: number;
		downloads: number;
		reviews: number;
	};
}

export interface Purchase {
	id: string;
	userId: string;
	appId: string;
	price: number;
	paymentMethod?: string;
	transactionId?: string;
	status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
	purchasedAt: string;
	expiresAt?: string;
	user: {
		id: string;
		userName: string;
		email: string;
		avatarUrl?: string;
	};
	app: {
		id: string;
		name: string;
		iconUrl: string;
		slug: string;
	};
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
	data: any;
}

interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface GetUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
}

interface GetPurchasesParams {
	page?: number;
	limit?: number;
	userId?: string;
	appId?: string;
	status?: string;
}

export const AdminService = {
	// Get dashboard statistics
	getDashboardStats: async (): Promise<DashboardStats> => {
		const response = await Axios.get<DashboardStats>("/admin/stats");
		return response.data;
	},

	// Get recent activity
	getRecentActivity: async (): Promise<Activity[]> => {
		const response = await Axios.get<Activity[]>("/admin/activity");
		return response.data;
	},

	// Get users with pagination
	getUsers: async (
		params?: GetUsersParams,
	): Promise<{ users: User[]; pagination: any }> => {
		const queryParams = new URLSearchParams();

		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.search) queryParams.append("search", params.search);
		if (params?.role) queryParams.append("role", params.role);

		const queryString = queryParams.toString();
		const url = queryString ? `/admin/users?${queryString}` : "/admin/users";

		const response = await Axios.get<{ users: User[]; pagination: any }>(url);
		return response.data;
	},

	// Get purchases/orders with pagination
	getPurchases: async (
		params?: GetPurchasesParams,
	): Promise<{ purchases: Purchase[]; pagination: any }> => {
		const queryParams = new URLSearchParams();

		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.userId) queryParams.append("userId", params.userId);
		if (params?.appId) queryParams.append("appId", params.appId);
		if (params?.status) queryParams.append("status", params.status);

		const queryString = queryParams.toString();
		const url = queryString
			? `/admin/purchases?${queryString}`
			: "/admin/purchases";

		const response = await Axios.get<{
			purchases: Purchase[];
			pagination: any;
		}>(url);
		return response.data;
	},
};
