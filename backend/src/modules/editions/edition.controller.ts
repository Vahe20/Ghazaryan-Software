import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError } from "../../utils/errors.js";
import { createEditionSchema, updateEditionSchema } from "./edition.types.js";
import * as editionService from "./edition.service.js";

export const listEditions = asyncHandler(async (req: Request, res: Response) => {
	const editions = await editionService.getEditions(req.params.appId);
	res.json(editions);
});

export const createEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = createEditionSchema.parse(req.body);
	const edition = await editionService.createEdition(req.params.appId, data);
	res.status(201).json(edition);
});

export const updateEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const data = updateEditionSchema.parse(req.body);
	const edition = await editionService.updateEdition(req.params.editionId, data);
	res.json(edition);
});

export const deleteEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	await editionService.deleteEdition(req.params.editionId);
	res.json({ message: "Edition deleted" });
});
