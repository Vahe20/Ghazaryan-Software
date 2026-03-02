export default {
	PORT: process.env.PORT || 4000,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "secret-access-key",
	FRONTEND_URL: process.env.FRONTEND_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
	// Redis configuration
	REDIS_ENABLED: process.env.REDIS_ENABLED === "true" || false,
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: Number.parseInt(process.env.REDIS_PORT || "6379"),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_DB: Number.parseInt(process.env.REDIS_DB || "0"),
};