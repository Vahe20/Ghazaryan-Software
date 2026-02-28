import { Router } from "express";
import * as newsController from "./news.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createNewsSchema, updateNewsSchema } from "./news.types.js";

const router = Router();

router.get("/", newsController.getAll);
router.get("/:id", newsController.getById);

router.use(authMiddleware, requireRole("ADMIN"));

router.post("/", validate(createNewsSchema), newsController.create);
router.put("/:id", validate(updateNewsSchema), newsController.update);
router.delete("/:id", newsController.remove);

export default router;
