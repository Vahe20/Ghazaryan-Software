import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { registerSchema, loginSchema } from "./auth.types";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, authController.getMe);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
