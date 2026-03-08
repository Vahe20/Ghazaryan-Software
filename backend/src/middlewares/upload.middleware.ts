import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import type { Request } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_UPLOAD_TYPES = [
	"avatar",
	"mods",
	"screenshots",
	"archives",
	"news",
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
			return cb(new Error("Invalid upload type"), "");
		}

		if (!type || !isValidUploadType(type)) {
			return cb(new Error("Invalid upload type"), "");
		}

		const uploadDir = path.resolve(__dirname, "..", "..", "uploads", type);

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
		const type = req.params.type;

		// Для архивов используем название приложения, если передано
		if (type === "archives" && req.query.appName && typeof req.query.appName === "string") {
			const appName = req.query.appName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			const timestamp = Date.now();
			cb(null, `${appName}-${timestamp}${ext}`);
		} else {
			const name = crypto.randomUUID();
			cb(null, `${name}${ext}`);
		}
	},
});

const ALLOWED_MIME_TYPES_BY_TYPE: Record<UploadType, string[]> = {
	avatar: ["image/png", "image/jpeg", "image/webp"],
	screenshots: ["image/png", "image/jpeg", "image/webp"],
	news: ["image/png", "image/jpeg", "image/webp"],

	mods: ["application/zip", "application/x-zip-compressed", "application/x-zip", "application/octet-stream"],
	archives: ["application/zip", "application/x-zip-compressed", "application/x-zip", "application/octet-stream", "application/rar", "application/x-rar-compressed"],
};

export const upload = multer({
	storage,
	limits: {
		fileSize: 2 * 1024 * 1024 * 1024, // 2gb
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
