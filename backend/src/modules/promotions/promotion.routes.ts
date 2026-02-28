import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import * as promotionController from "./promotion.controller.js";

const router = Router({ mergeParams: true });

router.get("/", promotionController.listPromotions);
router.post("/", authMiddleware, requireRole("ADMIN", "DEVELOPER"), promotionController.createPromotion);
router.patch("/:promotionId", authMiddleware, requireRole("ADMIN", "DEVELOPER"), promotionController.updatePromotion);
router.delete("/:promotionId", authMiddleware, requireRole("ADMIN"), promotionController.deletePromotion);

export default router;
