import { Router } from "express";
import * as adminController from "./admin.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware, requireRole("ADMIN"));

router.get("/stats", adminController.getDashboardStats);
router.get("/activity", adminController.getRecentActivity);
router.get("/users", adminController.getUsers);
router.get("/purchases", adminController.getPurchases);

export default router;
