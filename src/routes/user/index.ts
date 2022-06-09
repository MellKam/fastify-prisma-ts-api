import { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../../plugins/plugin-names.js';
import { USER_SERVICE } from '../service-names.js';
import { userRouter } from './user.router.js';
import { UserService } from './user.service.js';

const userServiceCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const userService = new UserService(fastify.db.user);
	fastify.decorate(USER_SERVICE, userService);

	done();
};

export const userServicePlugin = plugin(userServiceCallback, {
	name: USER_SERVICE,
	dependencies: [DATABASE_PLUGIN],
});

export const userRoutePlugin = plugin<{ prefix: string }>(
	async (fastify, opts) => {
		await fastify.register(userRouter, { prefix: opts.prefix });
	},
	{
		dependencies: [USER_SERVICE],
	},
);
