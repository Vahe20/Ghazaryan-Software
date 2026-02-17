import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validation.middleware";
import { registerSchema, loginSchema, changePasswordSchema } from "./auth.types";
import authMiddleware from "../../middlewares/auth.middleware";
import { authLimiter, registerLimiter } from "../../middlewares/rateLimit";

const router = Router();

router.get("/me", authMiddleware, authController.getMe);

router.post(
	"/register",
	registerLimiter,
	validate(registerSchema),
	authController.register,
);

router.post(
	"/login",
	authLimiter,
	validate(loginSchema),
	authController.login,
);

router.patch(
	"/password",
	authMiddleware,
	validate(changePasswordSchema),
	authController.changePassword,
);

router.delete(
	"/account",
	authMiddleware,
	authController.deleteAccount,
);

export default router;
