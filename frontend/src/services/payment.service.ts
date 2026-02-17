import { Axios } from "../config/Axios";
import { Purchase } from "../types/Entities";

interface TopUpResponse {
    message: string;
    balance: number;
}

interface PurchaseResponse {
    message: string;
    purchase: Purchase;
}

export const PaymentService = {
    topUpBalance(amount: number) {
        return Axios.patch<TopUpResponse>("/payment/top-up", { amount })
            .then(res => res.data);
    },

    purchaseApp(appId: string) {
        return Axios.post<PurchaseResponse>("/payment/purchase", { appId })
            .then(res => res.data);
    },

    getPaymentHistory() {
        return Axios.get<Purchase[]>("/payment/history")
            .then(res => res.data);
    },
};
