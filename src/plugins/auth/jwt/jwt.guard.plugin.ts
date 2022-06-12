import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { JWT_GUARD_PLUGIN, JWT_PLUGIN } from '../../plugin-names.js';
import { jwtGuard } from './jwt.guard.js';

const jwtGuardPluginCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	fastify.decorateRequest('auth', null);
	fastify.decorate('jwtGuard', jwtGuard);

	done();
};

export const jwtGuardPlugin = plugin(jwtGuardPluginCallback, {
	name: JWT_GUARD_PLUGIN,
	dependencies: [JWT_PLUGIN],
});
