import { prisma } from "../../config/prisma.js";
import { NotFoundError, DatabaseError } from "../../utils/errors.js";
import type { CreateNewsInput, UpdateNewsInput } from "./news.types.js";

export async function getAllNews(params: { page?: number; limit?: number } = {}) {
	try {
		const { page = 1, limit = 20 } = params;
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			prisma.news.findMany({
				skip,
				take: limit,
				orderBy: { publishedAt: "desc" },
			}),
			prisma.news.count(),
		]);

		return {
			news: items,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		};
	} catch (error) {
		throw new DatabaseError("Failed to fetch news", error);
	}
}

export async function getNewsById(id: string) {
	try {
		const item = await prisma.news.findUnique({ where: { id } });
		if (!item) throw new NotFoundError("News", id);
		return item;
	} catch (error) {
		if (error instanceof NotFoundError) throw error;
		throw new DatabaseError("Failed to fetch news item", error);
	}
}

export async function createNews(data: CreateNewsInput) {
	try {
		return await prisma.news.create({ data });
	} catch (error) {
		throw new DatabaseError("Failed to create news", error);
	}
}

export async function updateNews(id: string, data: UpdateNewsInput) {
	try {
		const existing = await prisma.news.findUnique({ where: { id } });
		if (!existing) throw new NotFoundError("News", id);
		return await prisma.news.update({ where: { id }, data });
	} catch (error) {
		if (error instanceof NotFoundError) throw error;
		throw new DatabaseError("Failed to update news", error);
	}
}

export async function deleteNews(id: string) {
	try {
		const existing = await prisma.news.findUnique({ where: { id } });
		if (!existing) throw new NotFoundError("News", id);
		return await prisma.news.delete({ where: { id } });
	} catch (error) {
		if (error instanceof NotFoundError) throw error;
		throw new DatabaseError("Failed to delete news", error);
	}
}
