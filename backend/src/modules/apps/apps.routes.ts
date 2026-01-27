import { Router } from "express";
import * as appsController from "./apps.controller";
import {
	validate,
	validateQuery,
} from "../../middlewares/validation.middleware";
import { createAppSchema, updateAppSchema, getAppsQuerySchema } from "./app.schema";

const router = Router();

// Public routes
router.get("/", validateQuery(getAppsQuerySchema), appsController.getApps);
// router.get("/featured", appsController.getFeaturedApps);
// router.get("/popular", appsController.getPopularApps);
router.get("/slug/:slug", appsController.getAppBySlug);
router.get("/:id", appsController.getAppById);
router.post("/:id/download", appsController.downloadApp);

// Admin routes (TODO: add auth middleware)
router.post("/", validate(createAppSchema), appsController.createApp);
router.put("/:id", validate(updateAppSchema), appsController.updateApp);
router.delete("/:id", appsController.deleteApp);

export default router;
