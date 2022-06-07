import { isProductionEnv } from './environment.js';

export interface ErrorWithMessage {
	message: string;
}

enum ErrorStatusCode {
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	INTERNAL = 500,
}

export class HttpError extends Error {
	constructor(readonly message: string, readonly statusCode: ErrorStatusCode) {
		super(message);
	}
}

export class BadRequestError extends HttpError {
	constructor(readonly message: string) {
		super(message, ErrorStatusCode.BAD_REQUEST);
	}
}

export class UnauthorizedError extends HttpError {
	constructor(readonly message: string) {
		super(message, ErrorStatusCode.UNAUTHORIZED);
	}
}

export class ForbiddentError extends HttpError {
	constructor(readonly message: string) {
		super(message, ErrorStatusCode.FORBIDDEN);
	}
}

export class InternalServerError extends HttpError {
	constructor(readonly msg?: string) {
		const message = !isProductionEnv && msg ? msg : 'Internal server error';
		super(message, ErrorStatusCode.INTERNAL);
	}
}
