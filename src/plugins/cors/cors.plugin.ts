import { FastifyPluginCallback } from 'fastify';
import cors from '@fastify/cors';
import plugin from 'fastify-plugin';
import { CONFIG_PLUGIN, CORS_PLUGIN } from '../plugin-names.js';

const corsPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.register(cors, {
		origin: fastify.config.WEB_APP_URL,
		credentials: true,
	});

	done();
};

export const corsPlugin = plugin(corsPluginCallback, {
	name: CORS_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
