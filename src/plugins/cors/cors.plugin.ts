import cors from '@fastify/cors';
import plugin from 'fastify-plugin';
import { CONFIG_PLUGIN, CORS_PLUGIN } from '../plugin-names.js';

export const corsPlugin = plugin(
	async (fastify) => {
		await fastify.register(cors, {
			origin: fastify.config.WEB_APP_URL,
			credentials: true,
		});
	},
	{
		name: CORS_PLUGIN,
		dependencies: [CONFIG_PLUGIN],
	},
);
