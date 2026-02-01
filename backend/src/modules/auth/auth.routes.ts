import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.types";
import authMiddleware from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, authController.getMe);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(refreshTokenSchema), authController.logout);

export default router;
