import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import initConfig from './config.service.js';
import { CONFIG_PLUGIN } from '../plugin-names.js';
import { CONFIG_DECORATOR } from '../decorator-names.js';

const pluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	try {
		const config = initConfig();

		fastify.decorate(CONFIG_DECORATOR, config);
		fastify.log.info(config, 'Server config');

		done();
	} catch (error: any) {
		done(error);
	}
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
