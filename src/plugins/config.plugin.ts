import plugin from 'fastify-plugin';
import env from 'env-var';
import { NODE_ENV_ENUM } from '../utils/node-env';
import { FastifyPluginCallback } from 'fastify';

interface IConfig {
	NODE_ENV: NODE_ENV_ENUM;
	PORT: number;
	DATABASE_URL: string;
}

declare module 'fastify' {
	export interface FastifyInstance {
		config: IConfig;
	}
}

export const CONFIG_PLUGIN = 'configPlugin';

const pluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const NODE_ENV =
		(env.get('NODE_ENV').asString() as NODE_ENV_ENUM) ??
		NODE_ENV_ENUM.development;

	const PORT = env.get('PORT').asPortNumber() ?? 5000;

	const DATABASE_URL = env.get('DATABASE_URL').asString();
	if (!DATABASE_URL)
		return done(new Error('Environment variable DATABASE_URL not provided'));

	const config: IConfig = {
		NODE_ENV, // default "development"
		PORT, // default 5000
		DATABASE_URL, // required
	};

	fastify.decorate('config', config);

	fastify.log.info(config, 'Server config');
	done();
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
