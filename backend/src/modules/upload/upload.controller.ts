import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ValidationError } from "../../utils/errors.js";
import config from "../../config/env.js";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new ValidationError("No file uploaded");
	}

	const relativePath = `/uploads/${req.params.type}/${req.file.filename}`;
	const fileUrl = `${config.BACKEND_URL}${relativePath}`;

	res.status(201).json({
		url: fileUrl,
		filename: req.file.filename,
		size: req.file.size,
	});
});
