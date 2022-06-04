import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { AuthService, IAccessTokenPayload } from './auth.service.js';
import { AUTH_PLUGIN, CONFIG_PLUGIN } from '../plugin-names.js';

const authPluginCallback: FastifyPluginCallback = (fastyfy, _opts, done) => {
	const authService = new AuthService(fastyfy.config.JWT_SECRET);

	fastyfy.decorate('authService', authService);

	fastyfy.decorateRequest('auth', null);

	// executed on each request and set auth by user token(if it exist)
	fastyfy.addHook('preHandler', (req, _reply, done) => {
		const bearerToken = req.headers.authorization;

		if (bearerToken) {
			const token = bearerToken.split(' ')[1];
			const payload = authService.getTokenPayload(token) as IAccessTokenPayload;

			req.auth = payload;
		}
		done();
	});

	done();
};

export const authPlugin = plugin(authPluginCallback, {
	name: AUTH_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
