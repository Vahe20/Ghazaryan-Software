import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import * as editionController from "./edition.controller.js";

const router = Router({ mergeParams: true });

router.get("/", editionController.listEditions);
router.post("/", authMiddleware, requireRole("ADMIN", "DEVELOPER"), editionController.createEdition);
router.patch("/:editionId", authMiddleware, requireRole("ADMIN", "DEVELOPER"), editionController.updateEdition);
router.delete("/:editionId", authMiddleware, requireRole("ADMIN"), editionController.deleteEdition);

export default router;
