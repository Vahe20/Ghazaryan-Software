import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware";
import { createAppVersionSchema } from "./version.types";
import * as ctrl from "./version.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";

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
