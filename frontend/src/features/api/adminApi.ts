import { api } from "./baseApi";
import type { Purchase } from "@/src/types/Entities";
import type {
    AdminUser,
    DashboardStats,
    Activity,
    UserPurchase,
    UserDownload,
    UserReview,
} from "@/src/types/Admin";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStats, void>({
            query: () => "/admin/stats",
        }),

        getRecentActivity: builder.query<Activity[], void>({
            query: () => "/admin/activity",
        }),

        getAdminUsers: builder.query<
            { users: AdminUser[]; pagination: Pagination },
            { page?: number; limit?: number; search?: string; role?: string } | void
        >({
            query: (params = {}) => ({ url: "/admin/users", params: params || {} }),
            providesTags: [{ type: "Users", id: "LIST" }],
        }),

        getAdminUserById: builder.query<AdminUser, string>({
            query: (id) => `/admin/users/${id}`,
            providesTags: (_, __, id) => [{ type: "Users", id }],
        }),

        getAdminUserPurchases: builder.query<
            { purchases: UserPurchase[]; pagination: Pagination },
            { userId: string; page?: number; limit?: number }
        >({
            query: ({ userId, ...params }) => ({ url: `/admin/users/${userId}/purchases`, params }),
        }),

        getAdminUserDownloads: builder.query<
            { downloads: UserDownload[]; pagination: Pagination },
            { userId: string; page?: number; limit?: number }
        >({
            query: ({ userId, ...params }) => ({ url: `/admin/users/${userId}/downloads`, params }),
        }),

        getAdminUserReviews: builder.query<
            { reviews: UserReview[]; pagination: Pagination },
            { userId: string; page?: number; limit?: number }
        >({
            query: ({ userId, ...params }) => ({ url: `/admin/users/${userId}/reviews`, params }),
        }),

        updateUserRole: builder.mutation<AdminUser, { userId: string; role: string }>({
            query: ({ userId, role }) => ({
                url: `/admin/users/${userId}/role`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        banUser: builder.mutation<AdminUser, { userId: string; reason?: string; until?: string | null }>({
            query: ({ userId, ...data }) => ({ url: `/admin/users/${userId}/ban`, method: "PATCH", body: data }),
            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        unbanUser: builder.mutation<AdminUser, string>({
            query: (userId) => ({ url: `/admin/users/${userId}/unban`, method: "PATCH", body: {} }),
            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        deleteUser: builder.mutation<void, string>({
            query: (userId) => ({ url: `/admin/users/${userId}`, method: "DELETE" }),
            invalidatesTags: [{ type: "Users", id: "LIST" }],
        }),

        getAdminPurchases: builder.query<
            { purchases: Purchase[]; pagination: Pagination },
            { page?: number; limit?: number; userId?: string; appId?: string; status?: string } | void
        >({
            query: (params = {}) => ({ url: "/admin/purchases", params: params || {} }),
            providesTags: [{ type: "Purchases", id: "LIST" }],
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetRecentActivityQuery,
    useGetAdminUsersQuery,
    useGetAdminUserByIdQuery,
    useGetAdminUserPurchasesQuery,
    useGetAdminUserDownloadsQuery,
    useGetAdminUserReviewsQuery,
    useUpdateUserRoleMutation,
    useBanUserMutation,
    useUnbanUserMutation,
    useDeleteUserMutation,
    useGetAdminPurchasesQuery,
} = adminApi;
