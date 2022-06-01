import { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { AUTH_PLUGIN } from '../../plugins/auth/auth.plugin';
import { HASH_PLUGIN } from '../../plugins/hash/hash.plugin';
import { PRISMA_PLUGIN } from '../../plugins/prisma.plugin';
import { UserController } from './user.controller';
import userRoutePlugin from './user.route';
import { UserService } from './user.service';

const userPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const userService = new UserService(
		fastify.prisma.user,
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
	dependencies: [AUTH_PLUGIN, HASH_PLUGIN, PRISMA_PLUGIN],
});

export default userPlugin;
