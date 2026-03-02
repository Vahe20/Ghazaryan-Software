import { BaseRepository } from "./base.repository.js";
import type { Users } from "../generated/prisma/index.js";

export class UserRepository extends BaseRepository<Users> {
    async findById(id: string) {
        return this.prisma.users.findUnique({
            where: { id },
        });
    }

    async findByIdWithRelations(id: string) {
        return this.prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                userName: true,
                role: true,
                balance: true,
                blockedTime: true,
                attempt: true,
                avatarUrl: true,
                reviews: true,
                downloads: true,
                purchases: true,
                authoredApps: true,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
        });
    }

    async findByEmailWithPassword(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                userName: true,
                role: true,
                balance: true,
                blockedTime: true,
                attempt: true,
                avatarUrl: true,
                reviews: true,
                downloads: true,
                purchases: true,
                authoredApps: true,
                passwordHash: true,
                lastLoginAt: true,
                googleId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findByGoogleId(googleId: string) {
        return this.prisma.users.findUnique({
            where: { googleId },
        });
    }

    async findByEmailOrUsername(email: string, userName: string) {
        return this.prisma.users.findFirst({
            where: {
                OR: [{ email }, { userName }],
            },
        });
    }

    async findMany(options?: any) {
        return this.prisma.users.findMany(options);
    }

    async create(data: {
        email: string;
        userName: string;
        passwordHash: string;
        googleId?: string;
        avatarUrl?: string;
    }) {
        return this.prisma.users.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.users.update({
            where: { id },
            data,
        });
    }

    async updateAttempts(id: string, attempts: number, blockedTime: Date | null) {
        return this.prisma.users.update({
            where: { id },
            data: {
                attempt: attempts,
                blockedTime,
            },
        });
    }

    async resetAttempts(id: string) {
        return this.prisma.users.update({
            where: { id },
            data: {
                attempt: 0,
                blockedTime: null,
                lastLoginAt: new Date(),
            },
        });
    }

    async incrementBalance(id: string, amount: number) {
        return this.prisma.users.update({
            where: { id },
            data: {
                balance: { increment: amount },
            },
        });
    }

    async decrementBalance(id: string, amount: number) {
        return this.prisma.users.update({
            where: { id },
            data: {
                balance: { decrement: amount },
            },
            select: { id: true, balance: true },
        });
    }

    async delete(id: string) {
        return this.prisma.users.delete({
            where: { id },
        });
    }
}

export const userRepository = new UserRepository();
