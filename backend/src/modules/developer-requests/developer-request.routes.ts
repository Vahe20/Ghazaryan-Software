import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import * as ctrl from "./developer-request.controller.js";

const router = Router();

router.get("/me", authMiddleware, ctrl.getMyRequest);
router.post("/", authMiddleware, ctrl.submitRequest);
router.get("/", authMiddleware, requireRole("ADMIN"), ctrl.listRequests);
router.patch("/:requestId/review", authMiddleware, requireRole("ADMIN"), ctrl.reviewRequest);

export default router;
