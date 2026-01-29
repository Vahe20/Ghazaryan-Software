import { Request, Response } from "express";

export function uploadFile(req: Request, res: Response): void {
	if (!req.file) {
		res.status(400).json({ message: "No file uploaded" });
		return;
	}

	const fileUrl = `/uploads/${req.params.type}/${req.file.filename}`;

	res.status(201).json({
		url: fileUrl,
		filename: req.file.filename,
		size: req.file.size,
	});
}
