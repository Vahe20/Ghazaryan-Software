import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import { Prisma } from "../generated/prisma";

export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	console.error("Error:", {
		name: err.name,
		message: err.message,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		path: req.path,
		method: req.method,
	});

	if (err instanceof ApiError || err instanceof Error && (err as any).statusCode) {
		const apiErr = err as ApiError;
		return res.status(apiErr.statusCode).json(apiErr.toJSON());
	}

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		return handlePrismaError(err, res);
	}

	if (err instanceof Prisma.PrismaClientValidationError) {
		return res.status(400).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "Invalid data provided",
				details:
					process.env.NODE_ENV === "development" ? err.message : undefined,
			},
		});
	}

	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			error: {
				code: "INVALID_TOKEN",
				message: "Invalid authentication token",
			},
		});
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			error: {
				code: "TOKEN_EXPIRED",
				message: "Authentication token has expired",
			},
		});
	}

	if (err.name === "ValidationError") {
		return res.status(422).json({
			error: {
				code: "VALIDATION_ERROR",
				message: err.message,
			},
		});
	}

	if (err.name === "MulterError") {
		return res.status(400).json({
			error: {
				code: "FILE_UPLOAD_ERROR",
				message: err.message,
			},
		});
	}

	return res.status(500).json({
		error: {
			code: "INTERNAL_ERROR",
			message:
				process.env.NODE_ENV === "development"
					? err.message
					: "An unexpected error occurred",
			...(process.env.NODE_ENV === "development" && {
				stack: err.stack,
			}),
		},
	});
}

function handlePrismaError(
	err: Prisma.PrismaClientKnownRequestError,
	res: Response,
) {
	switch (err.code) {
		case "P2002":
			const field = (err.meta?.target as string[]) || ["field"];
			return res.status(409).json({
				error: {
					code: "DUPLICATE_ENTRY",
					message: `A record with this ${field.join(", ")} already exists`,
					details: { fields: field },
				},
			});

		case "P2025":
			return res.status(404).json({
				error: {
					code: "NOT_FOUND",
					message: "Record not found",
				},
			});

		case "P2003":
			return res.status(400).json({
				error: {
					code: "INVALID_REFERENCE",
					message: "Referenced record does not exist",
					details: { field: err.meta?.field_name },
				},
			});

		case "P2014":
			return res.status(400).json({
				error: {
					code: "RELATION_VIOLATION",
					message: "The change violates a required relation",
				},
			});

		case "P2016":
			return res.status(400).json({
				error: {
					code: "QUERY_ERROR",
					message: "Query could not be interpreted",
				},
			});

		default:
			return res.status(500).json({
				error: {
					code: "DATABASE_ERROR",
					message: "A database error occurred",
					...(process.env.NODE_ENV === "development" && {
						details: err.message,
					}),
				},
			});
	}
}

export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

export function notFoundHandler(req: Request, res: Response) {
	res.status(404).json({
		error: {
			code: "NOT_FOUND",
			message: `Route ${req.method} ${req.path} not found`,
		},
	});
}
