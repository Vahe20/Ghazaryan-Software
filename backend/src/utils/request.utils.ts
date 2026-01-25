import { Request } from "express";

export function parseIdParam(req: Request, paramName: string = "id"): number | null {
	const param = req.params[paramName];
	
	if (Array.isArray(param)) {
		return null;
	}
	
	const id = parseInt(param);
	
	if (isNaN(id)) {
		return null;
	}
	
	return id;
}

export function getClientIp(req: Request): string {
	return (
		(req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
		req.socket.remoteAddress ||
		"unknown"
	);
}

export function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return "Unknown error occurred";
}
