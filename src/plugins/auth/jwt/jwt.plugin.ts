import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { JwtService } from './jwt.service.js';
import { JWT_PLUGIN, CONFIG_PLUGIN } from '../../plugin-names.js';
import { JWT_SERVICE_DECORATOR } from '../../decorator-names.js';

const jwtPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const jwtService = new JwtService(
		fastify.config.JWT_SECRET,
		fastify.config.ACCESS_TOKEN_EXPIRES_TIME,
		fastify.config.REFRESH_TOKEN_EXPIRES_TIME,
	);

	fastify.decorate(JWT_SERVICE_DECORATOR, jwtService);

	done();
};

export const jwtPlugin = plugin(jwtPluginCallback, {
	name: JWT_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
