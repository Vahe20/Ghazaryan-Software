import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createDownloadSchema } from "./download.schema.js";
import * as downloadController from "./download.controller.js";

const router = Router();

router.post("/", () => {
	(validate(createDownloadSchema),
		authMiddleware,
		downloadController.downloads);
});
