import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { HashService } from './hash.service.js';
import { CONFIG_PLUGIN, HASH_PLUGIN } from '../plugin-names.js';
import bcrypt from 'bcryptjs';

const hashPluginCallback: FastifyPluginCallback = (fastyfy, _opts, done) => {
	fastyfy.decorate(
		'hashService',
		new HashService(bcrypt, fastyfy.config.SALT_ROUNDS),
	);

	done();
};

export const hashPlugin = plugin(hashPluginCallback, {
	name: HASH_PLUGIN,
	dependencies: [CONFIG_PLUGIN],
});
