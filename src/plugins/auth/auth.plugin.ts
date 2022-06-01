import plugin from 'fastify-plugin';
import { CONFIG_PLUGIN } from '../config/config.plugin';
import { FastifyPluginCallback } from 'fastify';
import { AuthService, IAccessTokenPayload } from './auth.service';

const authPluginCallback: FastifyPluginCallback = (fastyfy, _opts, done) => {
	const authService = new AuthService(fastyfy.config.JWT_SECRET);

	fastyfy.decorate('authService', authService);

	fastyfy.decorateRequest('auth', null);

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

export const AUTH_PLUGIN = 'authPlugin';

const authPlugin = plugin(authPluginCallback, {
	name: AUTH_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});

export default authPlugin;
