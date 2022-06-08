import { FastifyPluginCallback } from 'fastify';
import { UserController } from './user.controller.js';
import { PUBLIC_USER_SCHEMA } from './user.schema.js';

export const userRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const userController = new UserController(fastify.userService);

	fastify.route({
		method: 'GET',
		url: '/me',
		schema: {
			response: {
				200: {
					$ref: PUBLIC_USER_SCHEMA,
				},
			},
		},
		preHandler: fastify.jwtGuard,
		handler: userController.me,
	});

	done();
};
