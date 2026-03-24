import type { PrismaClient, Sessions } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import config from "../config/env.js";

export class SessionRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    createSession(data: { userId: string; refreshToken: string }): Promise<Sessions> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config.SESSION_EXPIRES_DAYS);

        return this.prisma.sessions.create({
            data: {
                ...data,
                expiresAt,
            },
        });
    }

    findSessionByToken(refreshToken: string) {
        return this.prisma.sessions.findUnique({
            where: { refreshToken },
        });
    }

    rotateSessionToken(id: string, refreshToken: string): Promise<Sessions> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + config.SESSION_EXPIRES_DAYS);

        return this.prisma.sessions.update({
            where: { id },
            data: {
                refreshToken,
                expiresAt,
                revoked: false,
            },
        });
    }

    deleteSession(id: string) {
        return this.prisma.sessions.delete({
            where: { id },
        });
    }
}

export const sessionRepository = new SessionRepository();