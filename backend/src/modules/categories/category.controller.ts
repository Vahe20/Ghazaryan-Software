import { Request, Response } from "express";
import * as categoryService from "./category.service";

export async function getCategories(req: Request, res: Response): Promise<void> {
	try {
		const categories = await categoryService.getAllCategories();
		res.json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		res.status(500).json({ error: "Failed to fetch categories" });
	}
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const category = await categoryService.getCategoryById(id);

		if (!category) {
			res.status(404).json({ error: "Category not found" });
			return;
		}

		res.json(category);
	} catch (error) {
		console.error("Error fetching category:", error);
		res.status(500).json({ error: "Failed to fetch category" });
	}
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
	try {
		const slug = req.params.slug;
		if (Array.isArray(slug)) {
			res.status(400).json({ error: "Invalid slug parameter" });
			return;
		}

		const category = await categoryService.getCategoryBySlug(slug);

		if (!category) {
			res.status(404).json({ error: "Category not found" });
			return;
		}

		res.json(category);
	} catch (error) {
		console.error("Error fetching category:", error);
		res.status(500).json({ error: "Failed to fetch category" });
	}
}

export async function createCategory(req: Request, res: Response): Promise<void> {
	try {
		const category = await categoryService.addCategory(req.body);
		res.status(201).json(category);
	} catch (error) {
		console.error("Error creating category:", error);
		const message = error instanceof Error ? error.message : "Failed to create category";
		res.status(400).json({ error: message });
	}
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const category = await categoryService.updateCategoryById(id, req.body);
		res.json(category);
	} catch (error) {
		console.error("Error updating category:", error);
		const message = error instanceof Error ? error.message : "Failed to update category";
		res.status(400).json({ error: message });
	}
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const category = await categoryService.deleteCategoryById(id);
		res.json({ message: "Category deleted successfully", category });
	} catch (error) {
		console.error("Error deleting category:", error);
		const message = error instanceof Error ? error.message : "Failed to delete category";
		res.status(400).json({ error: message });
	}
}
