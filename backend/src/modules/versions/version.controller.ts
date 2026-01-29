import { Request, Response } from "express";
import * as service from "./version.service";
import { AuthRequest } from "../../types";

interface Params {
	appId: string;
}

export async function createVersion(req: AuthRequest, res: Response) {
	if (!req.file) {
		res.status(400).json({ message: "File required" });
		return;
	}

	if (Array.isArray(req.params.appId)) {
		res.status(400).json({ message: "id is array" });
		return;
	}

	const version = await service.addVersion(
		req.params.appId,
		req.body,
		req.file,
	);

	res.status(201).json(version);
}

export async function listVersions(req: Request<Params>, res: Response) {
	res.json(await service.getVersions(req.params.appId));
}
