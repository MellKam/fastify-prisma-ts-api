import plugin from 'fastify-plugin';
import { FastifyPluginCallback, preHandlerHookHandler } from 'fastify';
import { IAccessTokenPayload } from './jwt.service.js';
import { UnauthorizedError } from '../../../utils/http-errors.js';
import { JWT_GUARD_PLUGIN, JWT_PLUGIN } from '../../plugin-names.js';
import { AUTH_DECORATOR, JWT_GUARD_DECORATOR } from '../../decorator-names.js';

const jwtGuardPluginCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	fastify.decorateRequest(AUTH_DECORATOR, null);

	const jwtGuard: preHandlerHookHandler = (req, _reply, done) => {
		const bearerToken = req.headers.authorization;

		if (bearerToken) {
			const token = bearerToken.split(' ')[1];
			const payload =
				fastify.jwtService.verifyToken<IAccessTokenPayload>(token);

			req.auth = payload;
			done();
			return;
		}

		done(new UnauthorizedError('You are not authorized'));
	};

	fastify.decorate(JWT_GUARD_DECORATOR, jwtGuard);

	done();
};

export const jwtGuardPlugin = plugin(jwtGuardPluginCallback, {
	name: JWT_GUARD_PLUGIN,
	dependencies: [JWT_PLUGIN],
});
