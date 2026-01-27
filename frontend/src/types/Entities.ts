import { UUID } from "crypto";
import { Role } from "./Role";


export interface User {
    id: UUID;
    email: string;
    userName: string;
    fullName: string;
    role: Role;
    balance: number;
    avatarUrl: string;
}