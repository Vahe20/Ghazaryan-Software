export default {
	PORT: process.env.PORT || 4000,
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "secret key",
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "secret key",
};
