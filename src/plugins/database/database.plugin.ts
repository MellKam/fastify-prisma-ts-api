import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../plugin-names.js';
import prismaClient from './prisma-client.js';

export const databasePlugin = plugin(
	async (fastify) => {
		await prismaClient.$connect();

		fastify.addHook('onClose', async () => await prismaClient.$disconnect());

		fastify.decorate('db', prismaClient);
	},
	{ name: DATABASE_PLUGIN },
);
