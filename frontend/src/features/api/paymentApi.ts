import { api } from "./baseApi";
import { Purchase } from "@/src/types/Entities";

interface TopUpResponse {
    message: string;
    balance: number;
}

interface PurchaseResponse {
    message: string;
    purchase: Purchase;
    balance: number;
}

export const paymentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        topUpBalance: builder.mutation<TopUpResponse, number>({
            query: (amount) => ({
                url: "/payment/top-up",
                method: "PATCH",
                body: { amount },
            }),
        }),

        purchaseApp: builder.mutation<PurchaseResponse, string>({
            query: (appId) => ({
                url: "/payment/purchase",
                method: "POST",
                body: { appId },
            }),
        }),

        getPaymentHistory: builder.query<Purchase[], void>({
            query: () => "/payment/history",
        }),
    }),
});

export const {
    useTopUpBalanceMutation,
    usePurchaseAppMutation,
    useGetPaymentHistoryQuery,
} = paymentApi;
