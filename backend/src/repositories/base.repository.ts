import type { PrismaClient } from "../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";

export abstract class BaseRepository<T> {
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    abstract findById(id: string): Promise<T | null>;
    abstract findMany(options?: any): Promise<T[]>;
    abstract create(data: any): Promise<T>;
    abstract update(id: string, data: any): Promise<T>;
    abstract delete(id: string): Promise<T>;
}
