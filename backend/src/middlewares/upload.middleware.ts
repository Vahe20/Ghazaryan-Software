import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Request } from "express";

const ALLOWED_UPLOAD_TYPES = [
	"avatar",
	"mods",
	"screenshots",
	"archives",
] as const;

type UploadType = (typeof ALLOWED_UPLOAD_TYPES)[number];

function isValidUploadType(type: string): type is UploadType {
	return ALLOWED_UPLOAD_TYPES.includes(type as UploadType);
}

const storage = multer.diskStorage({
	destination: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void,
	) => {
		const type = req.params.type;

		if (Array.isArray(type)) {
			return;
		}

		if (!type || !isValidUploadType(type)) {
			return cb(new Error("Invalid upload type"), "");
		}

		const uploadDir = path.resolve("uploads", type);

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}

		cb(null, uploadDir);
	},

	filename: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void,
	) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const name = crypto.randomUUID();

		cb(null, `${name}${ext}`);
	},
});

const ALLOWED_MIME_TYPES_BY_TYPE: Record<UploadType, string[]> = {
	avatar: ["image/png", "image/jpeg", "image/webp"],
	screenshots: ["image/png", "image/jpeg", "image/webp"],
	mods: ["application/zip"],
	archives: ["application/zip"],
};

export const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1024 * 1024,
		files: 1,
	},
	fileFilter: (
		req: Request,
		file: Express.Multer.File,
		cb: FileFilterCallback,
	) => {
		const type = Array.isArray(req.params.type)
			? req.params.type[0]
			: req.params.type;

		if (!type || !isValidUploadType(type)) {
			return cb(
				new multer.MulterError(
					"LIMIT_UNEXPECTED_FILE",
					"Invalid upload type",
				),
			);
		}

		const allowed = ALLOWED_MIME_TYPES_BY_TYPE[type];
		if (!allowed.includes(file.mimetype)) {
			return cb(
				new multer.MulterError(
					"LIMIT_UNEXPECTED_FILE",
					`Invalid file type "${file.mimetype}" for upload type "${type}". Allowed: ${allowed.join(", ")}`,
				),
			);
		}

		cb(null, true);
	},
});
