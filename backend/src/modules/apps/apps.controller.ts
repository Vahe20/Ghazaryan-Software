import type { Request, Response } from "express";
import * as appsService from "./apps.service.js";
import type { AuthRequest, DownloadMetadata } from "../../types/index.js";
import { asyncHandler } from "../../middlewares/error.middleware.js";
import { ApiError, NotFoundError, ValidationError } from "../../utils/errors.js";
import type { GetAppsQuery } from "./apps.types.js";

export const getApps = asyncHandler(async (req: Request, res: Response) => {
	const result = await appsService.getAllApps(req.query as unknown as GetAppsQuery);
	res.json(result);
});

export const getAppById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id || Array.isArray(id)) {
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

	if (!slug || Array.isArray(slug)) {
		throw new ValidationError("Invalid slug parameter");
	}

	const app = await appsService.getAppBySlug(slug);

	if (!app) {
		throw new NotFoundError("App");
	}

	await appsService.incrementViewCount(app.id);
	res.json(app);
});

export const createApp = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const appData = {
		...req.body,
		authorId: req.user.userId,
	};

	const app = await appsService.addApp(appData);
	res.status(201).json(app);
});

export const updateApp = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	if (!id || Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const existingApp = await appsService.getAppById(id);

	if (!existingApp) {
		throw new NotFoundError("App", id);
	}

	const isAuthor = existingApp.authorId === req.user.userId;
	const isAdmin = req.user.role === "ADMIN";

	if (!isAuthor && !isAdmin) {
		throw ApiError.forbidden("Only the app author or admin can update this app");
	}

	const app = await appsService.updateAppById(id, req.body);
	res.json(app);
});

export const deleteApp = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	if (!id || Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const existingApp = await appsService.getAppById(id);

	if (!existingApp) {
		throw new NotFoundError("App", id);
	}

	const isAuthor = existingApp.authorId === req.user.userId;
	const isAdmin = req.user.role === "ADMIN";

	if (!isAuthor && !isAdmin) {
		throw ApiError.forbidden("Only the app author or admin can delete this app");
	}

	const app = await appsService.deleteAppById(id);
	res.json({ message: "App deleted successfully", app });
});

export const downloadApp = asyncHandler(async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	if (!id || Array.isArray(id)) {
		throw new ValidationError("Invalid ID parameter");
	}

	// Require authentication
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required to download apps");
	}

	const userId = req.user.userId;

	// Verify purchase for paid apps
	const app = await appsService.getAppById(id);
	if (app.price > 0) {
		const hasPurchase = await appsService.checkAppPurchase(userId, id);
		if (!hasPurchase) {
			throw ApiError.forbidden("You must purchase this app to download it");
		}
	}

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

export const getUserLibrary = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const result = await appsService.getUserLibrary(
		req.user.userId,
		req.query as unknown as GetAppsQuery,
	);
	res.json(result);
});

export const createVersion = asyncHandler(async (req: AuthRequest, res: Response) => {
	if (!req.params.appId || Array.isArray(req.params.appId)) {
		throw new ValidationError("Invalid appId parameter");
	}

	if (!req.user) {
		throw ApiError.unauthorized("Authentication required");
	}

	const existingApp = await appsService.getAppById(req.params.appId);

	if (!existingApp) {
		throw new NotFoundError("App", req.params.appId);
	}

	const isAuthor = existingApp.authorId === req.user.userId;
	const isAdmin = req.user.role === "ADMIN";

	if (!isAuthor && !isAdmin) {
		throw ApiError.forbidden("Only the app author or admin can create versions");
	}

	const version = await appsService.addVersion(
		req.params.appId,
		req.body,
	);

	res.status(201).json(version);
});

export const listVersions = asyncHandler(async (req: Request, res: Response) => {
	const { appId } = req.params;

	if (!appId || Array.isArray(appId)) {
		throw new ValidationError("Invalid appId parameter");
	}

	const versions = await appsService.getVersions(appId);
	res.json(versions);
});
