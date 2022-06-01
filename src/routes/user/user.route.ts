import { FastifyPluginCallback } from 'fastify';
import authGuard from '../../plugins/auth/auth.guard';
import { UserController } from './user.controller';
import {
	LOGIN_USER_REQ_SCHEMA_ID,
	LOGIN_USER_RES_SCHEMA_ID,
	REGISTER_USER_REQ_SCHEMA_ID,
	PUBLIC_USER_SCHEMA,
} from './user.schema';

const userRoutePlugin: FastifyPluginCallback<{
	userController: UserController;
}> = (fastify, opts, done) => {
	fastify.route({
		method: 'POST',
		url: '/register',
		schema: {
			body: { $ref: REGISTER_USER_REQ_SCHEMA_ID },
			response: {
				201: {
					$ref: PUBLIC_USER_SCHEMA,
				},
			},
		},
		handler: opts.userController.register,
	});

	fastify.route({
		method: 'POST',
		url: '/login',
		schema: {
			body: { $ref: LOGIN_USER_REQ_SCHEMA_ID },
			response: {
				200: { $ref: LOGIN_USER_RES_SCHEMA_ID },
			},
		},
		handler: opts.userController.login,
	});

	fastify.route({
		method: 'GET',
		url: '/me',
		schema: {
			response: {
				200: { $ref: PUBLIC_USER_SCHEMA },
			},
		},
		preHandler: authGuard,
		handler: opts.userController.me,
	});

	fastify.route({
		method: 'PATCH',
		url: '/refresh',
		// TODO response schema
		preHandler: authGuard,
		handler: opts.userController.refreshAccessToken,
	});

	fastify.route({
		method: 'PATCH',
		url: '/revoke',
		preHandler: authGuard,
		handler: opts.userController.revokeRefreshToken,
	});

	done();
};

export default userRoutePlugin;
