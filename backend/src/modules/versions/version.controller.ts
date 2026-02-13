import { Request, Response } from "express";
import * as service from "./version.service";
import { AuthRequest } from "../../types";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ValidationError } from "../../utils/errors";

export const createVersion = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.file) {
		throw new ValidationError("File required");
	}

	if (Array.isArray(req.params.appId)) {
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
	
	if (Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}
	
	const versions = await service.getVersions(appId);
	res.json(versions);
});
