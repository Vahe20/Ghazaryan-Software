import { Axios } from "../config/Axios";
import { App } from "../types/Entities";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
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
    user: { id: string; userName: string; email: string; avatarUrl?: string };
    app: { id: string; name: string; iconUrl: string; slug: string };
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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}


export const AdminService = {
    getDashboardStats: () =>
        Axios.get<DashboardStats>("/admin/stats").then(r => r.data),

    getRecentActivity: () =>
        Axios.get<Activity[]>("/admin/activity").then(r => r.data),

    getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
        const q = new URLSearchParams();
        if (params?.page)   q.append("page",   String(params.page));
        if (params?.limit)  q.append("limit",  String(params.limit));
        if (params?.search) q.append("search", params.search);
        if (params?.role)   q.append("role",   params.role);
        return Axios.get<{ users: AdminUser[]; pagination: Pagination }>(
            `/admin/users${q.toString() ? "?" + q : ""}`
        ).then(r => r.data);
    },

    updateUserRole: (userId: string, role: "USER" | "DEVELOPER" | "ADMIN") =>
        Axios.patch(`/admin/users/${userId}/role`, { role }).then(r => r.data),

    deleteUser: (userId: string) =>
        Axios.delete(`/admin/users/${userId}`).then(r => r.data),

    getPurchases: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
        const q = new URLSearchParams();
        if (params?.page)   q.append("page",   String(params.page));
        if (params?.limit)  q.append("limit",  String(params.limit));
        if (params?.search) q.append("search", params.search);
        if (params?.status) q.append("status", params.status);
        return Axios.get<{ purchases: Purchase[]; pagination: Pagination }>(
            `/admin/purchases${q.toString() ? "?" + q : ""}`
        ).then(r => r.data);
    },

    getApps: (params?: { page?: number; limit?: number; search?: string; status?: string; categoryId?: string }) => {
        const q = new URLSearchParams();
        if (params?.page)       q.append("page",       String(params.page));
        if (params?.limit)      q.append("limit",      String(params.limit));
        if (params?.search)     q.append("search",     params.search);
        if (params?.status)     q.append("status",     params.status);
        if (params?.categoryId) q.append("categoryId", params.categoryId);
        return Axios.get<{ apps: App[]; pagination: Pagination }>(
            `/apps${q.toString() ? "?" + q : ""}`
        ).then(r => r.data);
    },

    createApp: (data: Partial<App>) =>
        Axios.post<App>("/apps", data).then(r => r.data),

    updateApp: (id: string, data: Partial<App>) =>
        Axios.put<App>(`/apps/${id}`, data).then(r => r.data),

    deleteApp: (id: string) =>
        Axios.delete(`/apps/${id}`).then(r => r.data),

    getCategories: () =>
        Axios.get<{ id: string; name: string; slug: string; description?: string; order: number }[]>("/categories").then(r => r.data),

    createCategory: (data: { name: string; description?: string; order?: number }) =>
        Axios.post("/categories", data).then(r => r.data),

    updateCategory: (id: string, data: { name?: string; description?: string; order?: number }) =>
        Axios.put(`/categories/${id}`, data).then(r => r.data),

    deleteCategory: (id: string) =>
        Axios.delete(`/categories/${id}`).then(r => r.data),
};
