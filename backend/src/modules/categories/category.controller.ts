import { Request, Response } from "express";
import * as categoryService from "./category.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { NotFoundError, ValidationError } from "../../utils/errors";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
	const categories = await categoryService.getAllCategories();
	res.json(categories);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const category = await categoryService.getCategoryById(id);

	if (!category) {
		throw new NotFoundError("Category", id);
	}

	res.json(category);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
	const { slug } = req.params;
	
	if (Array.isArray(slug)) {
		throw new ValidationError("Invalid slug parameter");
	}

	const category = await categoryService.getCategoryBySlug(slug);

	if (!category) {
		throw new NotFoundError("Category");
	}

	res.json(category);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
	const category = await categoryService.addCategory(req.body);
	res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const category = await categoryService.updateCategoryById(id, req.body);
	res.json(category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const category = await categoryService.deleteCategoryById(id);
	res.json({ message: "Category deleted successfully", category });
});
