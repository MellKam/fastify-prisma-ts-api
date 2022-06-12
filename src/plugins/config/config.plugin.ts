import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { CONFIG_PLUGIN } from '../plugin-names.js';
import envSchema from 'env-schema';
import { getEnvFileName } from '../../utils/environment.js';
import { AppConfig, configSchema } from './config.schema.js';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';

const pluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const config = envSchema<AppConfig>({
		dotenv: { path: getEnvFileName() },
		schema: configSchema,
		ajv: ajvFormats(
			new Ajv({
				allErrors: true,
				removeAdditional: true,
				useDefaults: true,
				coerceTypes: true,
			}),
		),
	});

	fastify.decorate('config', config);

	done();
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
