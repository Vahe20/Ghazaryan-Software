import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import * as reviewController from "./review.controller";

const router = Router();

router.post("/apps/:appId/reviews", authMiddleware, reviewController.createReview);

export default router;
