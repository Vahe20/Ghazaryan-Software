import { Router } from "express";
import * as adminController from "./admin.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, requireAdmin());

router.get("/stats", adminController.getDashboardStats);
router.get("/activity", adminController.getRecentActivity);

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.get("/users/:id/purchases", adminController.getUserPurchases);
router.get("/users/:id/downloads", adminController.getUserDownloads);
router.get("/users/:id/reviews", adminController.getUserReviews);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/ban", adminController.banUser);
router.patch("/users/:id/unban", adminController.unbanUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/purchases", adminController.getPurchases);

export default router;
