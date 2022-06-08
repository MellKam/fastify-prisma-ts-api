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

const userRouteCallback: FastifyPluginCallback<{ prefix: string }> = (
	fastify,
	opts,
	done,
) => {
	fastify.register(userRouter, { prefix: opts.prefix });
	done();
};

export const userRoutePlugin = plugin(userRouteCallback, {
	dependencies: [USER_SERVICE],
});
