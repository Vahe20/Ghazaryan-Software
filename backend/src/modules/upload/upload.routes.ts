import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { uploadFile } from "./upload.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { uploadLimiter } from "../../middlewares/rateLimit/index.js";

const router = Router();

router.post(
	"/:type",
	uploadLimiter,
	authMiddleware,
	requireRole("DEVELOPER", "ADMIN"),
	upload.single("file"),
	uploadFile,
);

export default router;
