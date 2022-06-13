import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../plugin-names.js';
import { prismaPlugin } from './prisma/prisma.plugin.js';
import { redisPlugin } from './redis/redis.plugin.js';

export const databasePlugin = plugin(
	async (fastify) => {
		await fastify.register(prismaPlugin);
		await fastify.register(redisPlugin);
	},
	{
		name: DATABASE_PLUGIN,
	},
);
