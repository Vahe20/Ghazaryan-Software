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

const router = Router();

router.get("/", validateQuery(getAppsQuerySchema), appsController.getApps);
router.get("/slug/:slug", appsController.getAppBySlug);
router.get("/:id", appsController.getAppById);
router.post("/:id/download", appsController.downloadApp);

router.post(
	"/",
	authMiddleware,
	requireRole("ADMIN"),
	validate(createAppSchema),
	appsController.createApp,
);
router.put(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	validate(updateAppSchema),
	appsController.updateApp,
);
router.delete(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	appsController.deleteApp,
);

export default router;
