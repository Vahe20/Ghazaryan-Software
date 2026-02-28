import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const avatarStorage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		const dir = path.resolve(__dirname, "..", "..", "..", "uploads", "avatar");
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${crypto.randomUUID()}${ext}`);
	},
});

export const avatarUpload = multer({
	storage: avatarStorage,
	limits: { fileSize: 5 * 1024 * 1024, files: 1 },
	fileFilter: (_req, file, cb) => {
		const allowed = ["image/jpeg", "image/png", "image/webp"];
		if (!allowed.includes(file.mimetype)) {
			return cb(new Error("Only JPEG, PNG and WebP images are allowed"));
		}
		cb(null, true);
	},
});
