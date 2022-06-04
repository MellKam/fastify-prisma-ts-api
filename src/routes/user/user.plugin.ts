import { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import {
	AUTH_PLUGIN,
	DATABASE_PLUGIN,
	HASH_PLUGIN,
} from '../../plugins/plugin-names.js';
import { UserController } from './user.controller.js';
import userRoutePlugin from './user.route.js';
import { UserService } from './user.service.js';

declare module 'fastify' {
	export interface FastifyInstance {
		userService: UserService;
	}
}

const userPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const userService = new UserService(
		fastify.db.user,
		fastify.authService,
		fastify.hashService,
	);
	fastify.decorate('userService', userService);

	const userController = new UserController(fastify.userService);

	fastify.register(userRoutePlugin, {
		userController,
		prefix: '/user',
	});
	done();
};

const userPlugin = plugin(userPluginCallback, {
	dependencies: [AUTH_PLUGIN, HASH_PLUGIN, DATABASE_PLUGIN],
});

export default userPlugin;
