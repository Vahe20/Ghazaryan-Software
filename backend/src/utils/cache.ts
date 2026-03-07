import { getRedisClient } from "../config/redis.js";
import { createHash } from "node:crypto";

export async function getCached<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const cached = await redis.get(key);
        if (!cached) return null;

        return JSON.parse(cached) as T;
    } catch (error) {
        console.error(`Cache get error for key ${key}:`, error);
        return null;
    }
}

export async function setCached<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error(`Cache set error for key ${key}:`, error);
    }
}

export async function deleteCached(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Cache delete error for key ${key}:`, error);
    }
}

export async function deleteCachedByPattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error(`Cache delete by pattern error for ${pattern}:`, error);
    }
}

export function hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    return createHash("md5").update(str).digest("hex").substring(0, 8);
}

export async function withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300,
): Promise<T> {
    const cached = await getCached<T>(key);
    if (cached !== null) {
        return cached;
    }

    const result = await fn();

    await setCached(key, result, ttl);

    return result;
}
