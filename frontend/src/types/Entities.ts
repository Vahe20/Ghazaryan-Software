import { Role } from "./Role";


export type Platform = "Windows" | "macOS" | "Linux" | "Cross-platform";
export type PlatformType = "WINDOWS" | "MAC" | "LINUX" | "ANDROID" | "IOS";
export type SortType = "name" | "downloadCount" | "createdAt" | "rating";
export type StatusType = "BETA" | "RELEASE";
export type TagColor = "BLUE" | "PINK" | "PURPLE" | "GREEN";


export interface User {
    id: string;
    email: string;
    userName: string;
    role: Role;
    balance: number;
    avatarUrl: string;
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
    changelog: string;
    iconUrl: string;
    coverUrl: string;
    screenshots: string[];
    category: Category;
    categoryId: string;
    tags: string[];
    size: number;
    status: StatusType;
    platform: Platform[];
    downloadUrl: string;
    sourceUrl: string;
    documentationUrl: string;
    rating: number;
    viewCount: number;
    reviews: Review[];
    reviewCount: number;
    downloadCount: number;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
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
    user: User;
    userId: string;
    appId: string;
    title: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Download {
    id: string;
    userId: string;
    appId: string;
    version: string;
    platform: Platform;
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
    price: number;
    status: "pending" | "completed" | "failed";
    paymentMethod: string;
    purchasedAt: Date;
}