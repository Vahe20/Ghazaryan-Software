import type { Request, Response, NextFunction } from "express";

/**
 * Middleware для определения версии API
 * Поддерживает версионирование через:
 * 1. URL prefix: /api/v1/apps
 * 2. Accept header: Accept: application/vnd.ghazaryan.v1+json
 */
export function apiVersionMiddleware(req: Request, res: Response, next: NextFunction) {
    // Извлекаем версию из URL
    const urlMatch = req.path.match(/^\/api\/v(\d+)\//);
    if (urlMatch) {
        req.apiVersion = urlMatch[1];
        return next();
    }

    // Извлекаем версию из Accept header
    const acceptHeader = req.get("Accept");
    if (acceptHeader) {
        const headerMatch = acceptHeader.match(/application\/vnd\.ghazaryan\.v(\d+)\+json/);
        if (headerMatch) {
            req.apiVersion = headerMatch[1];
            return next();
        }
    }

    // По умолчанию используем версию 1
    req.apiVersion = "1";
    next();
}

/**
 * Middleware для проверки совместимости версии
 */
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
