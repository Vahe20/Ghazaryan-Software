export class ApiError extends Error {
	code: string;
	statusCode: number;
	details?: any;

	constructor(code: string, message: string, statusCode: number, details?: any) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	static badRequest(message: string = "Bad request", details?: any) {
		return new ApiError("BAD_REQUEST", message, 400, details);
	}

	static unauthorized(message: string = "Unauthorized") {
		return new ApiError("UNAUTHORIZED", message, 401);
	}

	static forbidden(message: string = "Access forbidden") {
		return new ApiError("FORBIDDEN", message, 403);
	}

	static notFound(message: string = "Resource not found") {
		return new ApiError("NOT_FOUND", message, 404);
	}

	static conflict(message: string = "Resource conflict", details?: any) {
		return new ApiError("CONFLICT", message, 409, details);
	}

	static validationError(message: string = "Validation error", details?: any) {
		return new ApiError("VALIDATION_ERROR", message, 422, details);
	}

	static tooManyRequests(message: string = "Too many requests") {
		return new ApiError("TOO_MANY_REQUESTS", message, 429);
	}

	static internal(message: string = "Internal server error", details?: any) {
		return new ApiError("INTERNAL_ERROR", message, 500, details);
	}

	static serviceUnavailable(message: string = "Service unavailable") {
		return new ApiError("SERVICE_UNAVAILABLE", message, 503);
	}

	toJSON() {
		return {
			error: {
				code: this.code,
				message: this.message,
				...(this.details && { details: this.details }),
			},
		};
	}
}

export class ValidationError extends ApiError {
	constructor(message: string, details?: any) {
		super("VALIDATION_ERROR", message, 422, details);
		this.name = "ValidationError";
	}
}

export class AuthenticationError extends ApiError {
	constructor(message: string = "Authentication failed") {
		super("AUTHENTICATION_ERROR", message, 401);
		this.name = "AuthenticationError";
	}
}

export class AuthorizationError extends ApiError {
	constructor(message: string = "Insufficient permissions") {
		super("AUTHORIZATION_ERROR", message, 403);
		this.name = "AuthorizationError";
	}
}

export class NotFoundError extends ApiError {
	constructor(resource: string, identifier?: string) {
		const message = identifier
			? `${resource} with identifier '${identifier}' not found`
			: `${resource} not found`;
		super("NOT_FOUND", message, 404);
		this.name = "NotFoundError";
	}
}

export class ConflictError extends ApiError {
	constructor(message: string, details?: any) {
		super("CONFLICT", message, 409, details);
		this.name = "ConflictError";
	}
}

export class DatabaseError extends ApiError {
	constructor(message: string = "Database operation failed", details?: any) {
		super("DATABASE_ERROR", message, 500, details);
		this.name = "DatabaseError";
	}
}
