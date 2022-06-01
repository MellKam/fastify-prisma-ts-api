import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import initConfig from './config.service';

export const CONFIG_PLUGIN = 'configPlugin';

const pluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const config = initConfig();
	if (config instanceof Error) {
		return done(config);
	}

	fastify.decorate('config', config);
	fastify.log.info(config, 'Server config');

	done();
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
