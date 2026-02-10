import { Axios } from "../config/Axios";
import { App } from "../types/Entities";

interface GetAppsParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
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
		if (params?.sortBy) queryParams.append("sortBy", params.sortBy);

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
