import { Axios } from "../config/Axios";
import { App } from "../types/Entities";

export interface GetAppsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	sortBy?: string;
	order?: "asc" | "desc";
	platform?: string;
	status?: string;
}

interface AppsResponse {
	apps: App[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const AppService = {
	getApps: async (params?: GetAppsParams): Promise<AppsResponse> => {
		const queryParams = new URLSearchParams();

		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.search) queryParams.append("search", params.search);
		if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
		if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
		if (params?.order) queryParams.append("order", params.order);
		if (params?.platform) queryParams.append("platform", params.platform);
		if (params?.status) queryParams.append("status", params.status);

		const queryString = queryParams.toString();
		const url = queryString ? `/apps?${queryString}` : "/apps";

		const response = await Axios.get<AppsResponse>(url);
		return response.data;
	},

	getAppBySlug: async (slug: string): Promise<App> => {
		const response = await Axios.get<App>(`/apps/slug/${slug}`);
		return response.data;
	},

	getAppById: async (id: string): Promise<App> => {
		const response = await Axios.get<App>(`/apps/${id}`);
		return response.data;
	},

	addApp: async (newApp: Partial<App>): Promise<App> => {
		const response = await Axios.post<App>("/apps", newApp);
		return response.data;
	},

	updateApp: async (appId: string, updates: Partial<App>): Promise<App> => {
		const response = await Axios.patch<App>(`/apps/${appId}`, updates);
		return response.data;
	},

	deleteApp: async (appId: string): Promise<void> => {
		await Axios.delete(`/apps/${appId}`);
	},

	getUserLibrary: async (): Promise<AppsResponse> => {
		const response = await Axios.get<AppsResponse>("/apps/library");
		return response.data;
	},
};
