import type { Request, Response, NextFunction } from "express";

export function apiVersionMiddleware(req: Request, res: Response, next: NextFunction) {
    const urlMatch = req.path.match(/^\/api\/v(\d+)\//);
    if (urlMatch) {
        req.apiVersion = urlMatch[1];
        return next();
    }

    const acceptHeader = req.get("Accept");
    if (acceptHeader) {
        const headerMatch = acceptHeader.match(/application\/vnd\.ghazaryan\.v(\d+)\+json/);
        if (headerMatch) {
            req.apiVersion = headerMatch[1];
            return next();
        }
    }

    req.apiVersion = "1";
    next();
}

export function requireApiVersion(version: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.apiVersion !== version) {
            return res.status(400).json({
                error: "API_VERSION_MISMATCH",
                message: `This endpoint requires API version ${version}`,
                currentVersion: req.apiVersion,
            });
        }
        next();
    };
}
