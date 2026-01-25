import { Router } from "express";
import { getApps, createApp, getAppById, updateApp, deleteApp } from "../controllers/apps.controller";

const router = Router();

router.get("/", getApps);

router.get("/:id", getAppById);

router.post("/", createApp);

router.put("/:id", updateApp);

router.delete("/:id", deleteApp);

export default router;
