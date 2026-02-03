import { UUID } from "crypto";
import { Role } from "./Role";


export interface User {
    id: UUID;
    email: string;
    userName: string;
    role: Role;
    balance: number;
    avatarUrl: string;
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