import { api } from "./baseApi";
import type { DeveloperRequest } from "@/src/types/Entities";

interface SubmitRequestInput {
    reason: string;
    portfolio?: string;
}

interface ReviewRequestInput {
    status: "APPROVED" | "REJECTED";
}

export const developerRequestsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyDeveloperRequest: builder.query<DeveloperRequest | null, void>({
            query: () => "/developer-requests/me",
            providesTags: [{ type: "DeveloperRequests", id: "ME" }],
        }),

        submitDeveloperRequest: builder.mutation<DeveloperRequest, SubmitRequestInput>({
            query: (data) => ({ url: "/developer-requests", method: "POST", body: data }),
            invalidatesTags: [{ type: "DeveloperRequests", id: "ME" }],
        }),

        listDeveloperRequests: builder.query<DeveloperRequest[], { status?: "PENDING" | "APPROVED" | "REJECTED" } | void>({
            query: (params = {}) => ({ url: "/developer-requests", params: params || {} }),
            providesTags: [{ type: "DeveloperRequests", id: "LIST" }],
        }),

        reviewDeveloperRequest: builder.mutation<DeveloperRequest, { requestId: string } & ReviewRequestInput>({
            query: ({ requestId, ...data }) => ({
                url: `/developer-requests/${requestId}/review`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [{ type: "DeveloperRequests", id: "LIST" }, { type: "Users", id: "LIST" }],
        }),
    }),
});

export const {
    useGetMyDeveloperRequestQuery,
    useSubmitDeveloperRequestMutation,
    useListDeveloperRequestsQuery,
    useReviewDeveloperRequestMutation,
} = developerRequestsApi;
