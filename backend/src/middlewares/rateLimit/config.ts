export const rateLimitConfig = {
	development: {
		enabled: true,
		global: {
			windowMs: 15 * 60 * 1000,
			max: 1000,
		},
		auth: {
			windowMs: 15 * 60 * 1000,
			max: 20,
		},
		register: {
			windowMs: 60 * 60 * 1000,
			max: 10,
		},
	},
	production: {
		enabled: true,
		global: {
			windowMs: 15 * 60 * 1000,
			max: 100,
		},
		auth: {
			windowMs: 15 * 60 * 1000,
			max: 5,
		},
		register: {
			windowMs: 60 * 60 * 1000,
			max: 3,
		},
	},
	test: {
		enabled: false,
		global: {
			windowMs: 15 * 60 * 1000,
			max: 10000,
		},
		auth: {
			windowMs: 15 * 60 * 1000,
			max: 10000,
		},
		register: {
			windowMs: 60 * 60 * 1000,
			max: 10000,
		},
	},
};

export const getCurrentRateLimitConfig = () => {
	const env = (process.env.NODE_ENV ||
		"development") as keyof typeof rateLimitConfig;
	return rateLimitConfig[env] || rateLimitConfig.development;
};
