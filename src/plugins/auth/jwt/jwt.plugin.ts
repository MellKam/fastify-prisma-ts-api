import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { JwtService } from './jwt.service.js';
import { JWT_PLUGIN, CONFIG_PLUGIN } from '../../plugin-names.js';
import jwt from 'jsonwebtoken';

const jwtPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.decorate('jwtService', new JwtService(jwt, fastify.config));

	done();
};

export const jwtPlugin = plugin(jwtPluginCallback, {
	name: JWT_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
