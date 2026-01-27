import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

const router = Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Admin routes (TODO: add auth middleware)
router.post(
	"/",
	validate(createCategorySchema),
	categoryController.createCategory,
);
router.put(
	"/:id",
	validate(updateCategorySchema),
	categoryController.updateCategory,
);
router.delete("/:id", categoryController.deleteCategory);

export default router;
