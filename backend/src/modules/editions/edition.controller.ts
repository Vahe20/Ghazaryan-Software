import type { Request, Response } from "express";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ValidationError } from "../../utils/errors.js";
import { createEditionSchema, updateEditionSchema, linkEditionSchema } from "./edition.types.js";
import * as editionService from "./edition.service.js";

export const listEditions = asyncHandler(async (req: Request, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const editions = await editionService.getEditions(appId);
	res.json(editions);
});

export const createEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const data = createEditionSchema.parse(req.body);
	const edition = await editionService.createEdition(appId, data);
	res.status(201).json(edition);
});

export const linkEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	const data = linkEditionSchema.parse(req.body);
	const edition = await editionService.linkEdition(appId, data);
	res.status(201).json(edition);
});

export const updateEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId, editionId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	if (!editionId || Array.isArray(editionId)) {
		throw new ValidationError("Invalid editionId parameter");
	}
	const data = updateEditionSchema.parse(req.body);
	const edition = await editionService.updateEdition(appId, editionId, data);
	res.json(edition);
});

export const deleteEdition = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { appId, editionId } = req.params;
	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	if (!editionId || Array.isArray(editionId)) {
		throw new ValidationError("Invalid editionId parameter");
	}
	await editionService.deleteEdition(appId, editionId);
	res.json({ message: "Edition deleted" });
});
