import { Router } from "express";
import * as appsController from "./apps.controller";
import {
	validate,
	validateQuery,
} from "../../middlewares/validation.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import {
	createAppSchema,
	updateAppSchema,
	getAppsQuerySchema,
} from "./apps.types";
import { requireRole } from "../../middlewares/role.middleware";
import {
	readLimiter,
	writeLimiter,
	downloadLimiter,
} from "../../middlewares/rateLimit";

const router = Router();

router.get(
	"/",
	readLimiter,
	validateQuery(getAppsQuerySchema),
	appsController.getApps,
);

router.get(
	"/library",
	readLimiter,
	authMiddleware,
	validateQuery(getAppsQuerySchema),
	appsController.getUserLibrary,
);

router.get("/slug/:slug", readLimiter, appsController.getAppBySlug);

router.get("/:id", readLimiter, appsController.getAppById);

router.post("/:id/download", downloadLimiter, appsController.downloadApp);

router.post(
	"/",
	writeLimiter,
	authMiddleware,
	requireRole("ADMIN"),
	validate(createAppSchema),
	appsController.createApp,
);

router.put(
	"/:id",
	writeLimiter,
	authMiddleware,
	requireRole("ADMIN"),
	validate(updateAppSchema),
	appsController.updateApp,
);

router.delete(
	"/:id",
	writeLimiter,
	authMiddleware,
	requireRole("ADMIN"),
	appsController.deleteApp,
);

export default router;
