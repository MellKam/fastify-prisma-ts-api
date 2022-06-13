import plugin from 'fastify-plugin';
import { AUTH_PLUGIN } from '../plugin-names.js';
import { jwtPlugin } from './jwt/jwt.plugin.js';
import { jwtGuardPlugin } from './jwt/jwt.guard.plugin.js';
import { googleAuthPlugin } from './google/google-auth.plugin.js';

export const authPlugin = plugin(
	async (fastify) => {
		await fastify.register(jwtPlugin);
		await fastify.register(jwtGuardPlugin);
		await fastify.register(googleAuthPlugin);
	},
	{
		name: AUTH_PLUGIN,
	},
);
