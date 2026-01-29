import { Request, Response } from "express";
import * as appsService from "./apps.service";
import { DownloadMetadata } from "../../types";

export async function getApps(req: Request, res: Response) {
	try {
		const result = await appsService.getAllApps(req.query as any);
		res.json(result);
	} catch (error) {
		console.error("Error fetching apps:", error);
		res.status(500).json({ error: "Failed to fetch apps" });
	}
}

export async function getAppById(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const app = await appsService.getAppById(id);

		if (!app) {
			res.status(404).json({ error: "App not found" });
			return;
		}

		await appsService.incrementViewCount(id);

		res.json(app);
	} catch (error) {
		console.error("Error fetching app:", error);
		res.status(500).json({ error: "Failed to fetch app" });
	}
}

export async function getAppBySlug(req: Request, res: Response) {
	try {
		const slug = req.params.slug;
		if (Array.isArray(slug)) {
			res.status(400).json({ error: "Invalid slug parameter" });
			return;
		}

		const app = await appsService.getAppBySlug(slug);

		if (!app) {
			res.status(404).json({ error: "App not found" });
			return;
		}

		await appsService.incrementViewCount(app.id);

		res.json(app);
	} catch (error) {
		console.error("Error fetching app:", error);
		res.status(500).json({ error: "Failed to fetch app" });
	}
}

export async function createApp(req: Request, res: Response) {
	try {
		const app = await appsService.addApp(req.body);
		res.status(201).json(app);
	} catch (error) {
		console.error("Error creating app:", error);
		const message =
			error instanceof Error ? error.message : "Failed to create app";
		res.status(400).json({ error: message });
	}
}

export async function updateApp(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const app = await appsService.updateAppById(id, req.body);
		res.json(app);
	} catch (error) {
		console.error("Error updating app:", error);
		const message =
			error instanceof Error ? error.message : "Failed to update app";
		res.status(400).json({ error: message });
	}
}

export async function deleteApp(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const app = await appsService.deleteAppById(id);
		res.json({ message: "App deleted successfully", app });
	} catch (error) {
		console.error("Error deleting app:", error);
		const message =
			error instanceof Error ? error.message : "Failed to delete app";
		res.status(400).json({ error: message });
	}
}

export async function downloadApp(req: Request, res: Response) {
	try {
		const id = req.params.id;
		if (Array.isArray(id)) {
			res.status(400).json({ error: "Invalid ID parameter" });
			return;
		}

		const userId = undefined;

		const metadata: DownloadMetadata = {
			version: req.body.version,
			platform: req.body.platform,
			ipAddress: req.ip as string | undefined,
			userAgent: req.get("user-agent"),
			country: req.body.country,
		};

		await appsService.recordDownload(id, userId, metadata);

		res.json({ message: "Download recorded successfully" });
	} catch (error) {
		console.error("Error recording download:", error);
		const message =
			error instanceof Error
				? error.message
				: "Failed to record download";
		res.status(400).json({ error: message });
	}
}

export async function getPopularApps(req: Request, res: Response) {
	try {
		const limitParam = req.query.limit as string;
		const limit =
			limitParam && !Array.isArray(limitParam)
				? parseInt(limitParam)
				: undefined;
		const apps = await appsService.getPopularApps(limit);
		res.json(apps);
	} catch (error) {
		console.error("Error fetching popular apps:", error);
		res.status(500).json({ error: "Failed to fetch popular apps" });
	}
}
