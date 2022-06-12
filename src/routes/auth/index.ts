import { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import {
	AUTH_PLUGIN,
	DATABASE_PLUGIN,
	HASH_PLUGIN,
} from '../../plugins/plugin-names.js';
import { AUTH_SERVICE } from '../service-names.js';
import { authRouter } from './auth.router.js';
import { AuthService } from './auth.service.js';

const authServiceCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const authService = new AuthService(
		fastify.db.user,
		fastify.db.localAuthData,
		fastify.jwtService,
		fastify.hashService,
		fastify.googleAuthService,
	);
	fastify.decorate(AUTH_SERVICE, authService);

	done();
};

export const authServicePlugin = plugin(authServiceCallback, {
	name: AUTH_SERVICE,
	dependencies: [AUTH_PLUGIN, HASH_PLUGIN, DATABASE_PLUGIN],
});

const authRouteCallback: FastifyPluginCallback<{ prefix: string }> = (
	fastify,
	opts,
	done,
) => {
	fastify.register(authRouter, { prefix: opts.prefix });
	done();
};

export const authRoutePlugin = plugin(authRouteCallback, {
	dependencies: [AUTH_SERVICE],
});
