import plugin from 'fastify-plugin';
import { DB_DECORATOR } from '../decorator-names.js';
import { DATABASE_PLUGIN } from '../plugin-names.js';
import prismaClient from './prisma-client.js';

export const databasePlugin = plugin(
	async (fastify) => {
		await prismaClient.$connect();

		fastify.addHook('onClose', async () => await prismaClient.$disconnect());

		fastify.decorate(DB_DECORATOR, prismaClient);
	},
	{ name: DATABASE_PLUGIN },
);
