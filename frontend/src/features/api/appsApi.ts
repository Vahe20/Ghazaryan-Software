import { api } from "./baseApi";
import { App } from "@/src/types/Entities";

interface GetAppsParams {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	sortBy?: string;
	order?: "asc" | "desc";
	platform?: string;
	status?: string;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

interface AppsResponse {
	apps: App[];
	pagination: Pagination;
}

export const appsApi = api.injectEndpoints({
	endpoints: builder => ({
		getApps: builder.query<AppsResponse, GetAppsParams | void>({
			query: (params = {}) => ({
				url: "/apps",
				params: params || {},
			}),
			providesTags: result =>
				result
					? [
						...result.apps.map(({ id }) => ({
							type: "Apps" as const,
							id,
						})),
						{ type: "Apps", id: "LIST" },
					]
					: [{ type: "Apps", id: "LIST" }],

		}),

		getAppById: builder.query<App, string>({
			query: id => `/apps/${id}`,
			providesTags: (_, __, id) => [{ type: "Apps", id }],
		}),

		getAppBySlug: builder.query<App, string>({
			query: slug => `/apps/slug/${slug}`,
			providesTags: result =>
				result ? [{ type: "Apps", id: result.id }] : [],
		}),

		getUserLibrary: builder.query<AppsResponse, void>({
			query: () => "/apps/library",
			providesTags: [{ type: "Apps", id: "LIBRARY" }],
		}),

		createApp: builder.mutation<App, Partial<App>>({
			query: data => ({
				url: "/apps",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "Apps", id: "LIST" }],
		}),

		updateApp: builder.mutation<App, { id: string; data: Partial<App> }>({
			query: ({ id, data }) => ({
				url: `/apps/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (_, __, { id }) => [
				{ type: "Apps", id },
				{ type: "Apps", id: "LIST" },
			],
		}),

		deleteApp: builder.mutation<void, string>({
			query: id => ({
				url: `/apps/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: [{ type: "Apps", id: "LIST" }],
		}),

		recordDownload: builder.mutation<void, { id: string; version?: string; platform?: string }>({
			query: ({ id, ...body }) => ({
				url: `/apps/${id}/download`,
				method: "POST",
				body,
			}),
		}),

		uploadFile: builder.mutation<
			{ url: string; filename: string; size: number },
			{
				type: "avatar" | "mods" | "screenshots" | "archives" | "news";
				file: File;
			}
		>({
			query: ({ type, file }) => {
				const formData = new FormData();
				formData.append("file", file);
				return {
					url: `/upload/${type}`,
					method: "POST",
					body: formData,
				};
			},
		}),

		purchaseApp: builder.mutation<
			{ message: string; purchase: unknown; balance: number },
			string
		>({
			query: (appId) => ({
				url: "/payment/purchase",
				method: "POST",
				body: { appId },
			}),
			invalidatesTags: [{ type: "Apps", id: "LIBRARY" }],
		}),

		createReview: builder.mutation<
			unknown,
			{ appId: string; rating: number; title?: string; comment: string }
		>({
			query: ({ appId, ...data }) => ({
				url: `/apps/${appId}/reviews`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: (_, __, { appId }) => [{ type: "Apps", id: appId }],
		}),
	}),
});

export const {
	useGetAppsQuery,
	useGetAppByIdQuery,
	useGetAppBySlugQuery,
	useGetUserLibraryQuery,
	useCreateAppMutation,
	useUpdateAppMutation,
	useDeleteAppMutation,
	useRecordDownloadMutation,
	useUploadFileMutation,
	usePurchaseAppMutation,
	useCreateReviewMutation,
	usePrefetch
} = appsApi;
