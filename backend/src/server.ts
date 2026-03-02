import "dotenv/config";
import config from "./config/env.js";
import { app } from "./app.js";
import { getRedisClient } from "./config/redis.js";

const PORT = config.PORT;

// Инициализируем Redis если включен
if (config.REDIS_ENABLED) {
	getRedisClient();
}

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});

