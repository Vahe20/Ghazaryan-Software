import { prisma } from "../../config/prisma";
import { slugGenerator } from "../../utils/slugGenerator";
import {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "./category.types";

export async function getAllCategories() {
	return await prisma.appsCategory.findMany();
}

export async function getCategoryById(id: string) {
	return await prisma.appsCategory.findUnique({ where: { id } });
}

export async function getCategoryBySlug(slug: string) {
	return await prisma.appsCategory.findUnique({ where: { slug } });
}

export async function addCategory(data: CreateCategoryInput) {
	const existsByName = await prisma.appsCategory.findUnique({
		where: { name: data.name },
	});

	if (existsByName) {
		throw new Error("Category with this name already exists");
	}

	const slug = slugGenerator(data.name);

	const newCategory = await prisma.appsCategory.create({
		data: {
			name: data.name,
			slug,
		},
	});

	return newCategory;
}

export async function updateCategoryById(
	id: string,
	data: UpdateCategoryInput,
) {
	const category = await prisma.appsCategory.findUnique({
		where: { id },
	});

	if (!category) {
		throw new Error("Category not found");
	}

	if (data.name) {
		const existsByName = await prisma.appsCategory.findUnique({
			where: { name: data.name },
		});

		if (existsByName && existsByName.id !== id) {
			throw new Error("Category with this name already exists");
		}
	}

	const updateData: any = {};

	if (data.name) {
		updateData.name = data.name;
		updateData.slug = slugGenerator(data.name);
	}

	if (data.description !== undefined) {
		updateData.description = data.description;
	}

	if (data.order !== undefined) {
		updateData.order = data.order;
	}

	const updatedCategory = await prisma.appsCategory.update({
		where: { id },
		data: updateData,
	});

	return updatedCategory;
}

export async function deleteCategoryById(id: string) {
	return await prisma.appsCategory.delete({ where: { id } });
}
