export default {
	PORT: process.env.PORT || 4000,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "secret key",
	FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
