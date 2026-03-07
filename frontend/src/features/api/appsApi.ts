import { api } from "./baseApi";
import type { App, AppEdition, AppVersion, AppPromotion, Review, Pagination } from "@/src/types/Entities";

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

interface AppsResponse {
    apps: App[];
    pagination: Pagination;
}

interface ReviewsResponse {
    reviews: Review[];
    pagination: Pagination;
}

interface CreateEditionInput {
    name: string;
    slug?: string;
    shortDesc?: string;
    price: number;
    status?: "BETA" | "RELEASE";
}

interface UpdateEditionInput {
    name?: string;
    slug?: string;
    shortDesc?: string;
    price?: number;
    status?: "BETA" | "RELEASE";
}

interface CreatePromotionInput {
    discountAmount?: number | null;
    discountPercent?: number | null;
    label?: string | null;
    startsAt: string | Date;
    endsAt: string | Date;
    isActive?: boolean;
}

interface CreateVersionInput {
    version: string;
    changelog?: string;
    status?: "BETA" | "RELEASE";
    downloadUrl: string;
}

export const appsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getApps: builder.query<AppsResponse, GetAppsParams | void>({
            query: (params = {}) => ({ url: "/apps", params: params || {} }),
            providesTags: (result) =>
                result
                    ? [...result.apps.map(({ id }) => ({ type: "Apps" as const, id })), { type: "Apps", id: "LIST" }]
                    : [{ type: "Apps", id: "LIST" }],
        }),

        getAppById: builder.query<App, string>({
            query: (id) => `/apps/${id}`,
            providesTags: (_, __, id) => [{ type: "Apps", id }],
        }),

        getAppBySlug: builder.query<App, string>({
            query: (slug) => `/apps/slug/${slug}`,
            providesTags: (result) => (result ? [{ type: "Apps", id: result.id }] : []),
        }),

        getUserLibrary: builder.query<AppsResponse, GetAppsParams | void>({
            query: (params = {}) => ({ url: "/apps/library", params: params || {} }),
            providesTags: [{ type: "Apps", id: "LIBRARY" }],
        }),

        createApp: builder.mutation<App, Partial<App>>({
            query: (data) => ({ url: "/apps", method: "POST", body: data }),
            invalidatesTags: [{ type: "Apps", id: "LIST" }],
        }),

        updateApp: builder.mutation<App, { id: string; data: Partial<App> }>({
            query: ({ id, data }) => ({ url: `/apps/${id}`, method: "PUT", body: data }),
            invalidatesTags: (_, __, { id }) => [{ type: "Apps", id }, { type: "Apps", id: "LIST" }],
        }),

        deleteApp: builder.mutation<void, string>({
            query: (id) => ({ url: `/apps/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "Apps", id: "LIST" }],
        }),

        recordDownload: builder.mutation<void, { id: string; version?: string; platform?: string }>({
            query: ({ id, ...body }) => ({ url: `/apps/${id}/download`, method: "POST", body }),
            invalidatesTags: (_, __, { id }) => [{ type: "Apps", id }],
        }),

        uploadFile: builder.mutation<
            { url: string; filename: string; size: number },
            { type: "avatar" | "mods" | "screenshots" | "archives" | "news"; file: File }
        >({
            query: ({ type, file }) => {
                const formData = new FormData();
                formData.append("file", file);
                return { url: `/upload/${type}`, method: "POST", body: formData };
            },
        }),

        getAppVersions: builder.query<AppVersion[], string>({
            query: (appId) => `/apps/${appId}/versions`,
            providesTags: (_, __, appId) => [{ type: "Versions", id: appId }],
        }),

        createAppVersion: builder.mutation<AppVersion, { appId: string } & CreateVersionInput>({
            query: ({ appId, ...rest }) => ({
                url: `/apps/${appId}/versions`,
                method: "POST",
                body: rest,
            }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Versions", id: appId }, { type: "Apps", id: appId }],
        }),

        getAppReviews: builder.query<ReviewsResponse, { appId: string; page?: number; limit?: number; rating?: number; sortBy?: string; order?: string }>({
            query: ({ appId, ...params }) => ({ url: `/apps/${appId}/reviews`, params }),
            providesTags: (_, __, { appId }) => [{ type: "Reviews", id: appId }],
        }),

        createReview: builder.mutation<Review, { appId: string; rating: number; title?: string; comment: string }>({
            query: ({ appId, ...data }) => ({ url: `/apps/${appId}/reviews`, method: "POST", body: data }),
            invalidatesTags: (result, __, { appId }) => result
                ? [{ type: "Reviews", id: appId }, { type: "Apps", id: appId }, { type: "Apps", id: "LIST" }]
                : [],
        }),

        updateReview: builder.mutation<Review, { reviewId: string; appId: string; rating?: number; title?: string; comment?: string }>({
            query: ({ reviewId, appId: _appId, ...data }) => ({ url: `/reviews/${reviewId}`, method: "PATCH", body: data }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Reviews", id: appId }],
        }),

        deleteReview: builder.mutation<void, { reviewId: string; appId: string }>({
            query: ({ reviewId }) => ({ url: `/reviews/${reviewId}`, method: "DELETE" }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Reviews", id: appId }, { type: "Apps", id: appId }],
        }),

        getAppEditions: builder.query<AppEdition[], string>({
            query: (appId) => `/apps/${appId}/editions`,
            providesTags: (_, __, appId) => [{ type: "Editions", id: appId }],
        }),

        createEdition: builder.mutation<AppEdition, { appId: string } & CreateEditionInput>({
            query: ({ appId, ...data }) => ({ url: `/apps/${appId}/editions`, method: "POST", body: data }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Editions", id: appId }],
        }),

        updateEdition: builder.mutation<AppEdition, { appId: string; editionId: string; data: UpdateEditionInput }>({
            query: ({ appId, editionId, data }) => ({ url: `/apps/${appId}/editions/${editionId}`, method: "PATCH", body: data }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Editions", id: appId }],
        }),

        deleteEdition: builder.mutation<void, { appId: string; editionId: string }>({
            query: ({ appId, editionId }) => ({ url: `/apps/${appId}/editions/${editionId}`, method: "DELETE" }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Editions", id: appId }],
        }),

        getAppPromotions: builder.query<AppPromotion[], { appId: string; activeOnly?: boolean }>({
            query: ({ appId, activeOnly }) => ({ url: `/apps/${appId}/promotions`, params: activeOnly ? { active: true } : {} }),
            providesTags: (_, __, { appId }) => [{ type: "Promotions", id: appId }],
        }),

        createPromotion: builder.mutation<AppPromotion, { appId: string } & CreatePromotionInput>({
            query: ({ appId, ...data }) => ({ url: `/apps/${appId}/promotions`, method: "POST", body: data }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Promotions", id: appId }],
        }),

        updatePromotion: builder.mutation<AppPromotion, { appId: string; promotionId: string; data: Partial<CreatePromotionInput> }>({
            query: ({ appId, promotionId, data }) => ({ url: `/apps/${appId}/promotions/${promotionId}`, method: "PATCH", body: data }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Promotions", id: appId }],
        }),

        deletePromotion: builder.mutation<void, { appId: string; promotionId: string }>({
            query: ({ appId, promotionId }) => ({ url: `/apps/${appId}/promotions/${promotionId}`, method: "DELETE" }),
            invalidatesTags: (_, __, { appId }) => [{ type: "Promotions", id: appId }],
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
    useGetAppVersionsQuery,
    useCreateAppVersionMutation,
    useGetAppReviewsQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useGetAppEditionsQuery,
    useCreateEditionMutation,
    useUpdateEditionMutation,
    useDeleteEditionMutation,
    useGetAppPromotionsQuery,
    useCreatePromotionMutation,
    useUpdatePromotionMutation,
    useDeletePromotionMutation,
    usePrefetch,
} = appsApi;
