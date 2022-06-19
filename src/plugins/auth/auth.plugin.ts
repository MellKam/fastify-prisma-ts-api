import plugin from 'fastify-plugin';
import { AUTH_PLUGIN } from '../plugin-names.js';
import { jwtPlugin } from './jwt/jwt.plugin.js';
import { googleAuthPlugin } from './google/google-auth.plugin.js';
import { loggedUserGuard } from './guards/logged-user.guard.js';
import { activatedUserGuard } from './guards/activated-user.guard.js';

export const authPlugin = plugin(
	async (fastify) => {
		await fastify.register(jwtPlugin);
		await fastify.register(googleAuthPlugin);

		fastify.decorateRequest('auth', null);
		fastify.decorate('loggedUserGuard', loggedUserGuard);
		fastify.decorate('activatedUserGuard', activatedUserGuard);
	},
	{
		name: AUTH_PLUGIN,
	},
);
