export class ApiError extends Error {
	code: string;
	statusCode: number;
	message: string;

	constructor(
		code: string,
		message: string,
		statusCode: number,
	) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.message = message;
	}

	static notFound(message: string) {
		return new ApiError("NOT_FOUND", message, 404);
	}
}
