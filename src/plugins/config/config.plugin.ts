import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { CONFIG_PLUGIN } from '../plugin-names.js';
import envSchema from 'env-schema';
import { getEnvFileName } from '../../utils/environment.js';
import { AppConfig, configSchema } from './config.schema.js';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';

const pluginCallback: FastifyPluginCallback<{ logConfig: boolean }> = (
	fastify,
	opts,
	done,
) => {
	try {
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

		if (opts.logConfig) {
			fastify.log.info(config, 'Server config');
		}

		done();
	} catch (error: any) {
		done(error);
	}
};

export const configPlugin = plugin(pluginCallback, { name: CONFIG_PLUGIN });
