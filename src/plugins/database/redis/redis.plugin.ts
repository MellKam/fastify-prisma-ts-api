import { createClient } from 'redis';
import plugin from 'fastify-plugin';
import { CONFIG_PLUGIN } from '../../plugin-names.js';

export const redisPlugin = plugin(
	async (fastify) => {
		const redisClient = createClient({ url: fastify.config.REDIS_URL });

		redisClient.on('error', (err) => fastify.log.error('Redis error: ', err));
		await redisClient.connect();

		fastify.addHook('onClose', async () => await redisClient.disconnect());
		fastify.decorate('redis', redisClient);
	},
	{ name: 'redisPlugin', dependencies: [CONFIG_PLUGIN] },
);
