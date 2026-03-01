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
    version: string;
    changelog: string | null;
    iconUrl: string;
    coverUrl: string | null;
    screenshots: string[];
    category: Category;
    categoryId: string;
    tags: string[];
    size: number;
    status: StatusType;
    platform: PlatformType[];
    downloadUrl: string;
    sourceUrl: string | null;
    documentationUrl: string | null;
    rating: number;
    viewCount: number;
    reviews: Review[];
    reviewCount: number;
    downloadCount: number;
    price: number;
    editions?: AppEdition[];
    versions?: AppVersion[];
    promotions?: AppPromotion[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AppEdition {
    id: string;
    appId: string;
    name: string;
    description: string | null;
    price: number;
    downloadUrl: string;
    features: string[];
    isDefault: boolean;
    isActive: boolean;
    promotions?: AppPromotion[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AppPromotion {
    id: string;
    appId: string;
    editionId: string | null;
    edition?: AppEdition | null;
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
    changelog: string;
    downloadUrl: string;
    size: number;
    isStable: boolean;
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
    userId: string;
    appId: string;
    version: string;
    platform: PlatformType;
    downloadedAt: Date;
}

export interface NewsItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    tagColor: TagColor;
    coverUrl?: string | null;
    link?: string | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Purchase {
    id: string;
    user: User;
    userId: string;
    app: App;
    appId: string;
    editionId: string | null;
    edition?: AppEdition | null;
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
