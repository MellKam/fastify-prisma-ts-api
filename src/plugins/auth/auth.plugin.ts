import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { AUTH_PLUGIN } from '../plugin-names.js';
import { jwtPlugin } from './jwt/jwt.plugin.js';
import { jwtGuardPlugin } from './jwt/jwt.guard.plugin.js';

const authPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.register(jwtPlugin);
	fastify.register(jwtGuardPlugin);

	done();
};

export const authPlugin = plugin(authPluginCallback, {
	name: AUTH_PLUGIN,
});
