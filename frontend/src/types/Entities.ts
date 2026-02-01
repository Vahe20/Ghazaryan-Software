import { UUID } from "crypto";
import { Role } from "./Role";

// ============ Enums ============

export enum Platform {
	WINDOWS = "WINDOWS",
	MAC = "MAC",
	LINUX = "LINUX",
	ANDROID = "ANDROID",
	IOS = "IOS",
}

export enum AppStatus {
	BETA = "BETA",
	RELEASE = "RELEASE",
}

export enum PurchaseStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
	REFUNDED = "REFUNDED",
}

// ============ User ============

export interface User {
	id: UUID;
	email: string;
	userName: string;
	fullName: string | null;
	role: Role;
	balance: number;
	avatarUrl: string | null;
	createdAt?: string;
	updatedAt?: string;
	lastLoginAt?: string | null;
}

// ============ Apps & Category ============

export interface AppsCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	order: number;
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
    category: AppsCategory;
	categoryId: string;
	tags: string[];
	size: number;
	platform: Platform[];
	minVersion: string | null;
	downloadUrl: string;
	sourceUrl: string | null;
	documentationUrl: string | null;
	downloadCount: number;
	viewCount: number;
	rating: number;
	reviewCount: number;
	status: AppStatus;
	featured: boolean;
	authorId: string | null;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string | null;
	price: number | null;
	isFree: boolean;
}

export interface AppWithCategory extends App {
	category: AppsCategory;
}

export interface AppWithRelations extends AppWithCategory {
	_count?: {
		reviews: number;
		downloads: number;
	};
	author?: User | null;
}

// ============ AppsVersion ============

export interface AppsVersion {
	id: string;
	appId: string;
	version: string;
	changelog: string;
	downloadUrl: string;
	size: number;
	isStable: boolean;
	releaseDate: string;
}

// ============ Reviews ============

export interface Review {
	id: string;
	appId: string;
	userId: string;
	rating: number;
	title: string | null;
	comment: string;
	helpful: number;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewWithUser extends Review {
	user: Pick<User, "id" | "userName" | "avatarUrl">;
}

// ============ Downloads ============

export interface Download {
	id: string;
	appId: string;
	userId: string | null;
	version: string;
	platform: Platform;
	ipAddress: string | null;
	userAgent: string | null;
	country: string | null;
	downloadedAt: string;
}

// ============ RefreshToken ============

export interface RefreshToken {
	id: string;
	token: string;
	userId: string;
	expiresAt: string;
	createdAt: string;
	revoked: boolean;
}

// ============ Purchases ============

export interface Purchase {
	id: string;
	userId: string;
	appId: string;
	price: number;
	paymentMethod: string | null;
	transactionId: string | null;
	status: PurchaseStatus;
	purchasedAt: string;
	expiresAt: string | null;
}
