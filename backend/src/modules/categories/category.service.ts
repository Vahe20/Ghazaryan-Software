import { prisma } from "../../config/prisma";
import { slugGenerator } from "../../utils/slugGenerator";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";
import {
	NotFoundError,
	ConflictError,
	DatabaseError,
} from "../../utils/errors";

export async function getAllCategories() {
	try {
		return await prisma.appsCategory.findMany();
	} catch (error) {
		throw new DatabaseError("Failed to fetch categories", error);
	}
}

export async function getCategoryById(id: string) {
	try {
		return await prisma.appsCategory.findUnique({ where: { id } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch category", error);
	}
}

export async function getCategoryBySlug(slug: string) {
	try {
		return await prisma.appsCategory.findUnique({ where: { slug } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch category", error);
	}
}

export async function addCategory(data: CreateCategoryInput) {
	try {
		const existsByName = await prisma.appsCategory.findUnique({
			where: { name: data.name },
		});

		if (existsByName) {
			throw new ConflictError("Category with this name already exists");
		}

		const slug = slugGenerator(data.name);

		const newCategory = await prisma.appsCategory.create({
			data: {
				name: data.name,
				slug,
			},
		});

		return newCategory;
	} catch (error) {
		if (error instanceof ConflictError) {
			throw error;
		}
		throw new DatabaseError("Failed to create category", error);
	}
}

export async function updateCategoryById(
	id: string,
	data: UpdateCategoryInput,
) {
	try {
		const category = await prisma.appsCategory.findUnique({
			where: { id },
		});

		if (!category) {
			throw new NotFoundError("Category", id);
		}

		if (data.name) {
			const existsByName = await prisma.appsCategory.findUnique({
				where: { name: data.name },
			});

			if (existsByName && existsByName.id !== id) {
				throw new ConflictError("Category with this name already exists");
			}
		}

		const updateData: any = {};

		if (data.name) {
			updateData.name = data.name;
			updateData.slug = slugGenerator(data.name);
		}

		const updatedCategory = await prisma.appsCategory.update({
			where: { id },
			data: updateData,
		});

		return updatedCategory;
	} catch (error) {
		if (
			error instanceof NotFoundError ||
			error instanceof ConflictError
		) {
			throw error;
		}
		throw new DatabaseError("Failed to update category", error);
	}
}

export async function deleteCategoryById(id: string) {
	try {
		return await prisma.appsCategory.delete({ where: { id } });
	} catch (error) {
		throw new DatabaseError("Failed to delete category", error);
	}
}
