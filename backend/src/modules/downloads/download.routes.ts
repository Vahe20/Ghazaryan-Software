import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createDownloadSchema } from "./download.schema";
import * as downloadController from "./download.controller";

const router = Router();

router.post("/", () => {
	(validate(createDownloadSchema),
		authMiddleware,
		downloadController.downloads);
});
