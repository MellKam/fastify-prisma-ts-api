import { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import {
	AUTH_PLUGIN,
	DATABASE_PLUGIN,
	HASH_PLUGIN,
} from '../../plugins/plugin-names.js';
import { AUTH_SERVICE } from '../service-names.js';
import { authRouter } from './auth.router.js';
import { AuthAppService } from './services/auth.app.service.js';

const authServiceCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const ACTIVATION_PATH = `${fastify.config.SSL ? 'https' : 'http'}://${
		fastify.config.HOST
	}:${fastify.config.PORT}/api/auth/activation`;

	const authService = new AuthAppService(
		{
			userRepository: fastify.prisma.user,
			localAuthRepository: fastify.prisma.localAuthData,
			googleAuthService: fastify.googleAuthService,
			hashService: fastify.hashService,
			jwtService: fastify.jwtService,
			redis: fastify.redis,
			transporter: fastify.transporter,
		},
		{
			ACTIVATION_PATH,
			ACTIVATION_CODE_REDIS_PREFIX: 'activation_code_',
			ACTIVATION_CODE_REDIS_TTL: '15min',
		},
	);

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
