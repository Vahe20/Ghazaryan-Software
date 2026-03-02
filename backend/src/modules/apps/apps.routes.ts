import { Router } from "express";
import * as appsController from "./apps.controller.js";
import {
	validate,
	validateQuery,
} from "../../middlewares/validation.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
	createAppSchema,
	updateAppSchema,
	getAppsQuerySchema,
	createAppVersionSchema,
} from "./apps.types.js";
import { requireAdmin } from "../../middlewares/role.middleware.js";
import {
	readLimiter,
	writeLimiter,
	downloadLimiter,
} from "../../middlewares/rateLimit/index.js";
import { upload } from "../../middlewares/upload.middleware.js";

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
	requireAdmin(),
	validate(createAppSchema),
	appsController.createApp,
);

router.put(
	"/:id",
	writeLimiter,
	authMiddleware,
	requireAdmin(),
	validate(updateAppSchema),
	appsController.updateApp,
);

router.delete(
	"/:id",
	writeLimiter,
	authMiddleware,
	requireAdmin(),
	appsController.deleteApp,
);

// Version management routes
router.get("/:appId/versions", readLimiter, appsController.listVersions);

router.post(
	"/:appId/versions",
	writeLimiter,
	authMiddleware,
	requireAdmin(),
	upload.single("file"),
	validate(createAppVersionSchema),
	appsController.createVersion,
);

export default router;
