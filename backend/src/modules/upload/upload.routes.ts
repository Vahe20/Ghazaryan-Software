import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import { uploadFile } from "./upload.controller";
import { requireRole } from "../../middlewares/role.middleware";
import { uploadLimiter } from "../../middlewares/rateLimit/index";

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
