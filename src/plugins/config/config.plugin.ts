import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import initConfig from './config.service';

export const CONFIG_PLUGIN = 'configPlugin';

const pluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	try {
		const config = initConfig();

		fastify.decorate('config', config);
		fastify.log.info(config, 'Server config');

		done();
	} catch (error: any) {
		done(error);
	}
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
