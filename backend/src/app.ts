import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import passport from "passport";
import swaggerUi from "swagger-ui-express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import config from "./config/env.js";
import { configurePassport } from "./config/passport.js";
import { swaggerSpec } from "./config/swagger.js";
import authRouter from "./modules/auth/auth.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import appsRoutes from "./modules/apps/apps.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import appVersionRoutes from "./modules/versions/version.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import newsRoutes from "./modules/news/news.routes.js";
import editionRoutes from "./modules/editions/edition.routes.js";
import promotionRoutes from "./modules/promotions/promotion.routes.js";
import developerRequestRoutes from "./modules/developer-requests/developer-request.routes.js";

import { apiLimiter, getCurrentRateLimitConfig } from "./middlewares/rateLimit/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

export const app = express();

const allowedOrigins = [config.FRONTEND_URL];

app.set("trust proxy", 1);

const isDevelopment = process.env.NODE_ENV !== "production";

app.use(cors({
	origin: function (origin, callback) {
		if (!origin || allowedOrigins.includes(origin) || isDevelopment) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
}));

app.use("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
	const { handleStripeWebhook } = await import("./modules/payment/payment.controller.js");
	return handleStripeWebhook(req, res, next);
});

app.use(express.json());

configurePassport();
app.use(passport.initialize());

const rateLimitConfig = getCurrentRateLimitConfig();
if (rateLimitConfig.enabled) app.use("/api/", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	customSiteTitle: "Ghazaryan Software API",
	customCss: ".swagger-ui .topbar { display: none }",
}));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/apps", appsRoutes);
app.use("/api/apps", appVersionRoutes);
app.use("/api/apps/:appId/editions", editionRoutes);
app.use("/api/apps/:appId/promotions", promotionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/developer-requests", developerRequestRoutes);

app.get("/auth/callback", (req, res) => {
	const queryIndex = req.originalUrl.indexOf("?");
	const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
	return res.redirect(`${config.FRONTEND_URL}/auth/callback${query}`);
});

app.use(notFoundHandler);
app.use(errorHandler);
