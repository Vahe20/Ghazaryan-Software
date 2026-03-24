import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
} from "./auth.types.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authLimiter, registerLimiter } from "../../middlewares/rateLimit/index.js";
import { avatarUpload } from "../../middlewares/avatarUpload.middleware.js";

const router = Router();

router.get("/me", authMiddleware, authController.getMe);

router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

router.patch("/password", authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.patch("/avatar", authMiddleware, avatarUpload.single("avatar"), authController.updateAvatar);

router.delete("/account", authMiddleware, authController.deleteAccount);

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleAuthCallback);

export default router;
