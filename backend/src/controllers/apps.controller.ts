import { Request, Response } from "express";
import { addApp, getAllApps, getAppById as getAppByIdService, updateAppById, deleteAppById } from "../services/apps.service";
import { parseIdParam } from "../utils/request.utils";

export async function getApps(req: Request, res: Response) {
	try {
		const apps = await getAllApps();
		res.json(apps);
	} catch (error) {
		console.error("Error fetching apps:", error);
		res.status(500).json({ error: "Failed to fetch apps" });
	}
}

export async function getAppById(req: Request, res: Response) {
	try {
		const id = parseIdParam(req);
		if (id === null) {
			return res.status(400).json({ error: "Invalid ID parameter" });
		}
		
		const app = await getAppByIdService(id);
		
		if (!app) {
			return res.status(404).json({ error: "App not found" });
		}
		
		res.json(app);
	} catch (error) {
		console.error("Error fetching app:", error);
		res.status(500).json({ error: "Failed to fetch app" });
	}
}

export async function createApp(req: Request, res: Response) {
	try {
		const app = await addApp(req.body);
		res.status(201).json(app);
	} catch (error) {
		console.error("Error creating app:", error);
		res.status(500).json({ error: "Failed to create app" });
	}
}

export async function updateApp(req: Request, res: Response) {
	try {
		const id = parseIdParam(req);
		if (id === null) {
			return res.status(400).json({ error: "Invalid ID parameter" });
		}
		
		const app = await updateAppById(id, req.body);
		
		if (!app) {
			return res.status(404).json({ error: "App not found" });
		}
		
		res.json(app);
	} catch (error) {
		console.error("Error updating app:", error);
		res.status(500).json({ error: "Failed to update app" });
	}
}

export async function deleteApp(req: Request, res: Response) {
	try {
		const id = parseIdParam(req);
		if (id === null) {
			return res.status(400).json({ error: "Invalid ID parameter" });
		}
		
		const app = await deleteAppById(id);
		
		if (!app) {
			return res.status(404).json({ error: "App not found" });
		}
		
		res.json({ message: "App deleted successfully", app });
	} catch (error) {
		console.error("Error deleting app:", error);
		res.status(500).json({ error: "Failed to delete app" });
	}
}
