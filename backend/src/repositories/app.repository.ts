import { BaseRepository } from "./base.repository.js";
import type { Apps } from "../generated/prisma/index.js";

export class AppRepository extends BaseRepository<Apps> {
    async findById(id: string) {
        return this.prisma.apps.findUnique({
            where: { id },
        });
    }

    async findByIdWithDetails(id: string) {
        return this.prisma.apps.findFirst({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                versions: {
                    orderBy: { releaseDate: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        version: true,
                        changelog: true,
                        status: true,
                        downloadUrl: true,
                        releaseDate: true,
                    },
                },
                reviews: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        rating: true,
                        title: true,
                        comment: true,
                        helpful: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                userName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                editions: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        downloads: true,
                    },
                },
            },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.apps.findFirst({
            where: { slug, deletedAt: null },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                author: {
                    select: {
                        id: true,
                        userName: true,
                        avatarUrl: true,
                    },
                },
                versions: {
                    orderBy: { releaseDate: "desc" },
                    take: 5,
                    select: {
                        id: true,
                        version: true,
                        changelog: true,
                        downloadUrl: true,
                        status: true,
                        releaseDate: true,
                    },
                },
                reviews: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        rating: true,
                        title: true,
                        comment: true,
                        helpful: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                userName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                editions: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        downloads: true,
                    },
                },
            },
        });
    }

    async findMany(options: any) {
        return this.prisma.apps.findMany(options);
    }

    async count(where: any) {
        return this.prisma.apps.count({ where });
    }

    async create(data: any) {
        return this.prisma.apps.create({ data });
    }

    async update(id: string, data: any) {
        return this.prisma.apps.update({
            where: { id },
            data,
        });
    }

    async incrementViewCount(id: string) {
        return this.prisma.apps.update({
            where: { id },
            data: {
                viewCount: { increment: 1 },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.apps.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}

export const appRepository = new AppRepository();
