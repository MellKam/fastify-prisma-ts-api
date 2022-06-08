import { FastifyPluginCallback } from 'fastify';
import { PUBLIC_USER_SCHEMA } from '../user/user.schema.js';
import { AuthController } from './auth.controller.js';
import {
	LOGIN_USER_REQ_SCHEMA,
	ACCESS_TOKEN_RES_SCHEMA,
	REGISTER_USER_REQ_SCHEMA,
} from './auth.schema.js';

export const authRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const authController = new AuthController(fastify.authService);

	fastify.route({
		method: 'POST',
		url: '/register',
		schema: {
			body: { $ref: REGISTER_USER_REQ_SCHEMA },
			response: {
				201: { $ref: PUBLIC_USER_SCHEMA },
			},
		},
		handler: authController.register,
	});

	fastify.route({
		method: 'POST',
		url: '/login',
		schema: {
			body: { $ref: LOGIN_USER_REQ_SCHEMA },
			response: {
				200: { $ref: ACCESS_TOKEN_RES_SCHEMA },
			},
		},
		handler: authController.login,
	});

	fastify.route({
		method: 'PATCH',
		url: '/refresh',
		schema: {
			response: {
				200: { $ref: ACCESS_TOKEN_RES_SCHEMA },
			},
		},
		preHandler: fastify.jwtGuard,
		handler: authController.refreshAccessToken,
	});

	fastify.route({
		method: 'PATCH',
		url: '/revoke',
		preHandler: fastify.jwtGuard,
		handler: authController.revokeRefreshToken,
	});

	done();
};
