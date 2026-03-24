const isProduction = process.env.NODE_ENV === "production";

export default {
	NODE_ENV: process.env.NODE_ENV || "development",
	IS_PRODUCTION: isProduction,
	PORT: Number.parseInt(process.env.PORT || "4000"),

	// Database
	DATABASE_URL: process.env.DATABASE_URL,

	// JWT
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
	JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
	JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

	// Auth security
	BCRYPT_SALT_ROUNDS: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
	AUTH_MAX_ATTEMPTS: Number.parseInt(process.env.AUTH_MAX_ATTEMPTS || "5"),
	AUTH_BLOCK_MINUTES: Number.parseInt(process.env.AUTH_BLOCK_MINUTES || "15"),

	// Sessions / cookies
	SESSION_EXPIRES_DAYS: Number.parseInt(process.env.SESSION_EXPIRES_DAYS || "30"),
	COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || "strict") as "strict" | "lax" | "none",
	COOKIE_SECURE: process.env.COOKIE_SECURE !== undefined
		? process.env.COOKIE_SECURE === "true"
		: isProduction,

	// External services
	FRONTEND_URL: process.env.FRONTEND_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

	// Redis
	REDIS_ENABLED: process.env.REDIS_ENABLED === "true",
	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: Number.parseInt(process.env.REDIS_PORT || "6379"),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_DB: Number.parseInt(process.env.REDIS_DB || "0"),
};