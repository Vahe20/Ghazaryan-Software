import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ValidationError } from "../../utils/errors";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new ValidationError("No file uploaded");
	}

	const fileUrl = `/uploads/${req.params.type}/${req.file.filename}`;

	res.status(201).json({
		url: fileUrl,
		filename: req.file.filename,
		size: req.file.size,
	});
});
