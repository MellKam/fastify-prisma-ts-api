import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { HashService } from './hash.service.js';
import { CONFIG_PLUGIN, HASH_PLUGIN } from '../plugin-names.js';
import { HASH_SERVICE_DECORATOR } from '../decorator-names.js';

const hashPluginCallback: FastifyPluginCallback = (fastyfy, _opts, done) => {
	const hashService = new HashService(fastyfy.config.SALT_ROUNDS);

	fastyfy.decorate(HASH_SERVICE_DECORATOR, hashService);
	done();
};

export const hashPlugin = plugin(hashPluginCallback, {
	name: HASH_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
