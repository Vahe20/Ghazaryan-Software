export default {
	PORT: process.env.PORT || 4000,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "secret-access-key",
	FRONTEND_URL: process.env.FRONTEND_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};