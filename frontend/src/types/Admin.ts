export type UserRole = "USER" | "DEVELOPER" | "ADMIN";
export type PurchaseStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type Platform = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";

export interface AdminUser {
    id: string;
    email: string;
    userName: string;
    role: UserRole;
    balance: number;
    avatarUrl?: string;
    createdAt: string;
    lastLoginAt?: string | null;
    isBanned: boolean;
    bannedUntil?: string | null;
    banReason?: string | null;
    _count: {
        purchases: number;
        downloads: number;
        reviews: number;
    };
}

export interface UserPurchase {
    id: string;
    appId: string;
    price: number;
    status: PurchaseStatus;
    purchasedAt: string;
    paymentMethod?: string | null;
    app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface UserDownload {
    id: string;
    version: string;
    platform: Platform;
    downloadedAt: string;
    app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface UserReview {
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
    createdAt: string;
    app: { id: string; name: string; iconUrl: string; slug: string };
}

export interface Purchase {
    id: string;
    userId: string;
    appId: string;
    price: number;
    paymentMethod?: string | null;
    transactionId?: string | null;
    status: PurchaseStatus;
    purchasedAt: string;
    expiresAt?: string | null;
    user: {
        id: string;
        userName: string;
        email: string;
        avatarUrl?: string | null;
    };
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
    data: Record<string, unknown>;
}
