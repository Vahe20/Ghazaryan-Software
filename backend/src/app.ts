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
import adminRoutes from "./modules/admin/admin.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import newsRoutes from "./modules/news/news.routes.js";
import editionRoutes from "./modules/editions/edition.routes.js";
import promotionRoutes from "./modules/promotions/promotion.routes.js";
import developerRequestRoutes from "./modules/developer-requests/developer-request.routes.js";

import { apiLimiter, getCurrentRateLimitConfig } from "./middlewares/rateLimit/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiVersionMiddleware } from "./middlewares/apiVersion.middleware.js";

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

app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
	const { handleStripeWebhook } = await import("./modules/payment/payment.controller.js");
	return handleStripeWebhook(req, res, next);
});

// Legacy webhook endpoint (redirect не работает, так как Stripe не ожидает редиректа)
app.use("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
	const { handleStripeWebhook } = await import("./modules/payment/payment.controller.js");
	return handleStripeWebhook(req, res, next);
});

app.use(express.json());

configurePassport();
app.use(passport.initialize());

// Middleware для определения версии API
app.use(apiVersionMiddleware);

const rateLimitConfig = getCurrentRateLimitConfig();
if (rateLimitConfig.enabled) app.use("/api/", apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	customSiteTitle: "Ghazaryan Software API",
	customCss: ".swagger-ui .topbar { display: none }",
}));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

// API v1 routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/apps", appsRoutes);
app.use("/api/v1/apps/:appId/editions", editionRoutes);
app.use("/api/v1/apps/:appId/promotions", promotionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/developer-requests", developerRequestRoutes);

// Legacy routes (redirect to v1)
app.use("/api/auth", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/upload", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/apps", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/categories", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/admin", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/payment", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/news", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));
app.use("/api/developer-requests", (req, res) => res.redirect(308, `/api/v1${req.originalUrl.replace("/api", "")}`));

app.get("/auth/callback", (req, res) => {
	const queryIndex = req.originalUrl.indexOf("?");
	const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
	return res.redirect(`${config.FRONTEND_URL}/auth/callback${query}`);
});

app.use(notFoundHandler);
app.use(errorHandler);
