import plugin from 'fastify-plugin';
import { FastifyPluginCallback, preHandlerHookHandler } from 'fastify';
import { IAccessTokenPayload } from './jwt.service.js';
import { JWT_GUARD_PLUGIN, JWT_PLUGIN } from '../../plugin-names.js';
import { UnauthorizedError } from '../../../utils/http-errors.js';

const jwtGuardPluginCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	fastify.decorateRequest('auth', null);

	const jwtGuard: preHandlerHookHandler = (req, reply, done) => {
		const bearerToken = req.headers.authorization;

		if (bearerToken) {
			const token = bearerToken.split(' ')[1];
			const payload =
				fastify.jwtService.verifyToken<IAccessTokenPayload>(token);

			if (payload !== null) {
				req.auth = payload;

				return done();
			}
		}

		return reply.send(new UnauthorizedError('You are not authorized'));
	};

	fastify.decorate('jwtGuard', jwtGuard);

	done();
};

export const jwtGuardPlugin = plugin(jwtGuardPluginCallback, {
	name: JWT_GUARD_PLUGIN,
	dependencies: [JWT_PLUGIN],
});
