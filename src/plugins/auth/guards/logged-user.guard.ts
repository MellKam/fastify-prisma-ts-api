import { preHandlerHookHandler } from 'fastify/types/hooks.js';
import { UnauthorizedError } from '../../../utils/http-errors.js';
import { AccessTokenPayload } from '../jwt/jwt.types.js';

export const loggedUserGuard: preHandlerHookHandler = function (
	req,
	reply,
	done,
) {
	const bearerToken = req.headers.authorization;

	if (bearerToken) {
		const token = bearerToken.split(' ')[1];
		const payload = this.jwtService.verifyToken<AccessTokenPayload>(token);

		if (payload !== null) {
			req.auth = payload;

			return done();
		}
	}

	return reply.send(new UnauthorizedError('You are not authorized'));
};
