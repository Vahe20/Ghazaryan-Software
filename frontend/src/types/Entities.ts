import { Role } from "./Role";

export type Platform = "Windows" | "macOS" | "Linux" | "Cross-platform";
export type PlatformType = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
export type SortType = "name" | "downloadCount" | "createdAt" | "rating";
export type StatusType = "BETA" | "RELEASE";
export type TagColor = "BLUE" | "PINK" | "PURPLE" | "GREEN";
export type PurchaseStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type DeveloperRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
    id: string;
    email: string;
    userName: string;
    role: Role;
    balance: number;
    avatarUrl: string | null;
    reviews: Review[];
    downloads: Download[];
    purchases: Purchase[];
    createdAt: Date;
    updatedAt: Date;
}

export interface App {
    id: string;
    name: string;
    slug: string;
    shortDesc: string;
    description: string;
    iconUrl: string;
    coverUrl: string | null;
    screenshots: string[];
    category: Category;
    categoryId: string;
    tags: string[];
    size: number;
    status: StatusType;
    platform: PlatformType[];
    minVersion: string | null;
    sourceUrl: string | null;
    documentationUrl: string | null;
    downloadCount: number;
    viewCount: number;
    rating: number;
    reviewCount: number;
    featured: boolean;
    authorId: string | null;
    author?: {
        id: string;
        userName: string;
        avatarUrl: string | null;
    };
    publishedAt: Date | null;
    deletedAt: Date | null;
    price: number;
    reviews?: Review[];
    editions?: AppEdition[];
    versions?: AppVersion[];
    promotions?: AppPromotion[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AppEdition {
    id: string;
    name: string;
    slug?: string;
    shortDesc?: string;
    price: number;
    status?: StatusType;
    parentAppId?: string | null;
    createdAt: Date;
    updatedAt?: Date;
}

export interface AppPromotion {
    id: string;
    appId: string;
    discountAmount: number | null;
    discountPercent: number | null;
    label: string | null;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    createdAt: Date;
}

export interface AppVersion {
    id: string;
    appId: string;
    version: string;
    changelog: string | null;
    status: StatusType;
    downloadUrl: string;
    releaseDate: Date;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Review {
    id: string;
    user: Pick<User, "id" | "userName" | "avatarUrl">;
    userId: string;
    appId: string;
    title: string | null;
    rating: number;
    comment: string;
    helpful: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Download {
    id: string;
    userId: string | null;
    appId: string;
    version: string;
    platform: PlatformType;
    ipAddress: string | null;
    userAgent: string | null;
    country: string | null;
    downloadedAt: Date;
}

export interface NewsItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    tagColor: TagColor;
    coverUrl: string | null;
    link: string | null;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Purchase {
    id: string;
    user: User;
    userId: string;
    app: App;
    appId: string;
    price: number;
    status: PurchaseStatus;
    paymentMethod: string | null;
    transactionId: string | null;
    purchasedAt: Date;
    expiresAt: Date | null;
}

export interface DeveloperRequest {
    id: string;
    userId: string;
    user?: Pick<User, "id" | "userName" | "email" | "avatarUrl">;
    reason: string;
    portfolio: string | null;
    status: DeveloperRequestStatus;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
