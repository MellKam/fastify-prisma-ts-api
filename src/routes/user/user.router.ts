import { FastifyPluginCallback } from 'fastify';
import { UserController } from './user.controller.js';
import { publicUserRef } from './user.schema.js';

export const userRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const userController = new UserController(fastify.userService);

	fastify.route({
		method: 'GET',
		url: '/me',
		schema: {
			response: {
				200: publicUserRef,
			},
		},
		preHandler: fastify.loggedUserGuard,
		handler: userController.me,
	});

	// TODO get user by id

	done();
};
