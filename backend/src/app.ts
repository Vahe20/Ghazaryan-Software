import express from "express";
import cors from "cors";
import path from "path";

import config from "./config/env";
import authRouter from "./modules/auth/auth.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import appsRoutes from "./modules/apps/apps.routes";
import categoryRoutes from "./modules/categories/category.routes";
import appVersionRoutes from "./modules/versions/version.routes";

import { apiLimiter, getCurrentRateLimitConfig } from "./middlewares/rateLimit";

export const app = express();

const allowedOrigins = [config.FRONTEND_URL];

app.set("trust proxy", 1);

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: [
			"Content-Range",
			"X-Content-Range",
			"RateLimit-Limit",
			"RateLimit-Remaining",
			"RateLimit-Reset",
		],
		maxAge: 600,
	}),
);

app.use(express.json());

const rateLimitConfig = getCurrentRateLimitConfig();
if (rateLimitConfig.enabled)
	app.use("/api/", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/apps", appsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/apps", appVersionRoutes);

app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		console.error("Error:", err);
		res.status(err.status || 500).json({
			error: err.message || "Internal server error",
		});
	},
);
