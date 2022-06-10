import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { JwtService } from './jwt.service.js';
import { JWT_PLUGIN, CONFIG_PLUGIN } from '../../plugin-names.js';

const jwtPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const jwtService = new JwtService(fastify.config);

	fastify.decorate('jwtService', jwtService);

	done();
};

export const jwtPlugin = plugin(jwtPluginCallback, {
	name: JWT_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
