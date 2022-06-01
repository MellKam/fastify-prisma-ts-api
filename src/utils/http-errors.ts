import createError from '@fastify/error';

export const ConflictError = createError(
	'FST_HTTP_CONFLICT_ERROR',
	'Error:',
	409,
);
export const InternalServerError = createError(
	'FST_HTTP_INTERNAL_SERVER_ERROR',
	'Error was occured on the server',
	500,
);
export const BadRequestError = createError(
	'FST_HTTP_BAD_REQUEST_ERROR',
	'Error:',
	400,
);
export const ForbiddentError = createError(
	'FST_HTTP_FORBIDDEN_ERROR',
	'Access forbidden for this route',
	403,
);
