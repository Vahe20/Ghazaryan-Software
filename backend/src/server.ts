import "dotenv/config";
import config from "./config/env.js";
import { app } from "./app.js";
import { getRedisClient } from "./config/redis.js";
import cron from "node-cron";
import { deactivateExpiredPromotions } from "./modules/promotions/promotion.service.js";

const PORT = config.PORT;

if (config.REDIS_ENABLED) {
	getRedisClient();
}

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`🚀 Swagger API documentation available at http://localhost:${PORT}/api/docs`);
});

cron.schedule("0 * * * *", async () => {
	try {
		console.log("📋 Running promotion deactivation task...");
		await deactivateExpiredPromotions();
	} catch (error) {
		console.error("❌ Error in promotion deactivation task:", error);
	}
});

deactivateExpiredPromotions().catch(error => {
	console.error("❌ Error on startup promotion check:", error);
});

