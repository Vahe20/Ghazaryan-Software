import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import * as newsService from "./news.service.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
	const { page, limit } = req.query;
	const data = await newsService.getAllNews({
		page: page ? Number(page) : undefined,
		limit: limit ? Number(limit) : undefined,
	});
	return res.json(data);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	if (Array.isArray(id) || !id)
		return res.status(400).json({ error: "Invalid ID" });

	const data = await newsService.getNewsById(id);
	return res.json(data);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = await newsService.createNews(req.body);
	return res.status(201).json(data);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	if (Array.isArray(id) || !id)
		return res.status(400).json({ error: "Invalid ID" });

	const data = await newsService.updateNews(id, req.body);
	return res.json(data);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	if (Array.isArray(id) || !id)
		return res.status(400).json({ error: "Invalid ID" });

	await newsService.deleteNews(id);
	return res.status(204).send();
});
