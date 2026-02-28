import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import * as reviewController from "./review.controller.js";

const router = Router();

router.get("/apps/:appId/reviews", reviewController.listReviews);
router.post("/apps/:appId/reviews", authMiddleware, reviewController.createReview);
router.patch("/reviews/:reviewId", authMiddleware, reviewController.updateReview);
router.delete("/reviews/:reviewId", authMiddleware, reviewController.deleteReview);

export default router;
