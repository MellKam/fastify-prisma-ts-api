import plugin from 'fastify-plugin';
import { CONFIG_PLUGIN } from '../config/config.plugin';
import { FastifyPluginCallback } from 'fastify';
import { HashService } from './hash.service';

const hashPluginCallback: FastifyPluginCallback = (fastyfy, _opts, done) => {
	const hashService = new HashService(fastyfy.config.SALT_ROUNDS);

	fastyfy.decorate('hashService', hashService);
	done();
};

export const HASH_PLUGIN = 'hashPlugin';

const hashPlugin = plugin(hashPluginCallback, {
	name: HASH_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});

export default hashPlugin;
