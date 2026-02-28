import type { Request, Response } from "express";
import * as service from "./version.service.js";
import type { AuthRequest } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ValidationError } from "../../utils/errors.js";

export const createVersion = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.file) {
		throw new ValidationError("File required");
	}

	if (!req.params.appId || Array.isArray(req.params.appId)) {
		throw new ValidationError("Invalid appId parameter");
	}

	const version = await service.addVersion(
		req.params.appId,
		req.body,
		req.file,
	);

	res.status(201).json(version);
});

export const listVersions = asyncHandler(async (req: Request, res: Response) => {
	const { appId } = req.params;

	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}

	const versions = await service.getVersions(appId);
	res.json(versions);
});
