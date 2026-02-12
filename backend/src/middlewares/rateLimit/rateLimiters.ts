import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => {
		return req.ip || req.socket.remoteAddress || "unknown";
	},
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
});

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: {
		error: "Too many authentication attempts, please try again after 15 minutes.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => {
		const email = req.body?.email || "unknown";
		const ip = req.ip || req.socket.remoteAddress || "unknown";
		return `${ip}-${email}`;
	},
	skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 3,
	message: {
		error: "Too many accounts created from this IP, please try again after an hour.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
});

export const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: {
		error: "Too many uploads from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const downloadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 50,
	message: {
		error: "Too many downloads from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const reviewLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	message: {
		error: "Too many reviews submitted, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const readLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	message: {
		error: "Too many read requests, please slow down.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const writeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 30,
	message: {
		error: "Too many write requests, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
