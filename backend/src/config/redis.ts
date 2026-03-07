import { Redis } from "ioredis";
import config from "./env.js";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (!config.REDIS_ENABLED) {
        return null;
    }

    if (!redisClient) {
        try {
            redisClient = new Redis({
                host: config.REDIS_HOST || "localhost",
                port: config.REDIS_PORT || 6379,
                password: config.REDIS_PASSWORD,
                db: config.REDIS_DB || 0,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: false,
            });

            redisClient.on("error", (err) => {
                console.error("Redis connection error:", err);
            });

            redisClient.on("connect", () => {
                console.log("✅ Redis connected successfully");
            });
        } catch (error) {
            console.error("Failed to initialize Redis:", error);
            return null;
        }
    }

    return redisClient;
}

/**
 * Закрыть Redis соединение
 */
export async function closeRedisConnection(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}

export default getRedisClient;
