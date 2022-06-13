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
	const ACTIVATION_PATH = `${fastify.config.SSL ? 'https' : 'http'}://${
		fastify.config.HOST
	}:${fastify.config.PORT}/api/auth/activation`;

	const authService = new AuthService({
		userRepository: fastify.prisma.user,
		localAuthRepository: fastify.prisma.localAuthData,
		googleAuthService: fastify.googleAuthService,
		hashService: fastify.hashService,
		jwtService: fastify.jwtService,
		transporter: fastify.transporter,
		ACTIVATION_PATH,
		redis: fastify.redis,
	});

	fastify.decorate(AUTH_SERVICE, authService);
	done();
};

export const authServicePlugin = plugin(authServiceCallback, {
	name: AUTH_SERVICE,
	dependencies: [AUTH_PLUGIN, HASH_PLUGIN, DATABASE_PLUGIN],
});

export const authRoutePlugin = plugin<{ prefix: string }>(
	async (fastify, opts) =>
		await fastify.register(authRouter, { prefix: opts.prefix }),
	{
		dependencies: [AUTH_SERVICE],
	},
);
