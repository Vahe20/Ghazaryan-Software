import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validated = await schema.parseAsync(req.body);
			req.body = validated;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error,
				});
			}
			next(error);
		}
	};
};

export const validateQuery = (schema: ZodSchema) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validated = await schema.parseAsync(req.query);
			Object.keys(req.query).forEach(key => delete req.query[key]);
			Object.assign(req.query, validated);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({
					error: "Validation failed",
					details: error,
				});
			}
			next(error);
		}
	};
};
