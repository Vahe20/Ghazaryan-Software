import { UUID } from "crypto";
import { Role } from "./Role";


export interface User {
    id: UUID;
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
    category: string;
    categoryId: string;
    tags: string[];
    size: number;
    platform: string;
    downloadUrl: string;
    sourceUrl: string;
    documentationUrl: string;
    
}

export interface Review {
    id: UUID;
    userId: UUID;
    appId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Download {
    id: UUID;
    userId: UUID;
    appId: string;
    version: string;
    platform: string;
    downloadedAt: Date;
}

export interface Purchase {
    id: UUID;
    user: User;
    app: App;
    price: number;
    status: "pending" | "completed" | "failed";
    paymentMethod: string;
    purchasedAt: Date;
}