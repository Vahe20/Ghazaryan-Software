import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createCategorySchema, updateCategorySchema } from "./category.types";
import authMiddleware from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

router.post(
	"/",
	authMiddleware,
	requireRole("ADMIN"),
	validate(createCategorySchema),
	categoryController.createCategory,
);
router.put(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	validate(updateCategorySchema),
	categoryController.updateCategory,
);
router.delete(
	"/:id",
	authMiddleware,
	requireRole("ADMIN"),
	categoryController.deleteCategory,
);

export default router;
