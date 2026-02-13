import { Request, Response } from "express";
import * as appsService from "./apps.service";
import { AuthRequest, DownloadMetadata } from "../../types";
import { asyncHandler } from "../../middlewares/error.middleware";
import { ApiError, NotFoundError, ValidationError } from "../../utils/errors";

export const getApps = asyncHandler(async (req: Request, res: Response) => {
	const result = await appsService.getAllApps(req.query as any);
	res.json(result);
});

export const getAppById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const app = await appsService.getAppById(id);

	if (!app) {
		throw new NotFoundError("App", id);
	}

	await appsService.incrementViewCount(id);
	res.json(app);
});

export const getAppBySlug = asyncHandler(async (req: Request, res: Response) => {
	const { slug } = req.params;
	
	if (Array.isArray(slug)) {
		throw new ValidationError("Invalid slug parameter");
	}

	const app = await appsService.getAppBySlug(slug);

	if (!app) {
		throw new NotFoundError("App");
	}

	await appsService.incrementViewCount(app.id);
	res.json(app);
});

export const createApp = asyncHandler(async (req: Request, res: Response) => {
	const app = await appsService.addApp(req.body);
	res.status(201).json(app);
});

export const updateApp = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const app = await appsService.updateAppById(id, req.body);
	res.json(app);
});

export const deleteApp = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	const app = await appsService.deleteAppById(id);
	res.json({ message: "App deleted successfully", app });
});

export const downloadApp = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	
	if (Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
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
});

export const getPopularApps = asyncHandler(async (req: Request, res: Response) => {
	const limitParam = req.query.limit as string;
	const limit =
		limitParam && !Array.isArray(limitParam)
			? parseInt(limitParam)
			: undefined;
	const apps = await appsService.getPopularApps(limit);
	res.json(apps);
});

export const getUserLibrary = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const result = await appsService.getUserLibrary(
		req.user.userId,
		req.query as any,
	);
	res.json(result);
});
