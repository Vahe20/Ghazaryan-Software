import { api } from "./baseApi";
import type { Purchase } from "@/src/types/Entities";

interface PurchaseResponse {
    message: string;
    purchase: Purchase;
    balance: number;
}

interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

export const paymentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation<CheckoutSessionResponse, number>({
            query: (amount) => ({ url: "/payment/checkout/create-session", method: "POST", body: { amount } }),
        }),

        purchaseApp: builder.mutation<PurchaseResponse, string>({
            query: (appId) => ({ url: "/payment/purchase", method: "POST", body: { appId } }),
            invalidatesTags: (_, __, appId) => [
                { type: "Apps", id: "LIBRARY" },
                { type: "Purchases", id: "LIST" },
                { type: "Apps", id: appId },
            ],
        }),

        getPaymentHistory: builder.query<{ purchases: Purchase[] }, void>({
            query: () => "/payment/history",
            providesTags: [{ type: "Purchases", id: "HISTORY" }],
        }),
    }),
});

export const {
    useCreateCheckoutSessionMutation,
    usePurchaseAppMutation,
    useGetPaymentHistoryQuery,
} = paymentApi;
