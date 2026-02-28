import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { createAppVersionSchema } from "./version.types.js";
import * as ctrl from "./version.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";

const router = Router();

router.get("/:appId/versions", ctrl.listVersions);

router.post(
	"/:appId/versions",
	authMiddleware,
	upload.single("file"),
	validate(createAppVersionSchema),
	ctrl.createVersion,
);

export default router;
