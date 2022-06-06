import createError from '@fastify/error';

export const BadRequestError = createError('HTTP_BAD_REQUEST_ERROR', '', 400);
export const UnauthorizedError = createError(
	'HTTP_UNAUTHORIZED_ERROR',
	'',
	401,
);
export const ForbiddentError = createError('HTTP_FORBIDDEN_ERROR', '', 403);
export const InternalServerError = createError(
	'HTTP_INTERNAL_SERVER_ERROR',
	'Error was occured on the server',
	500,
);
