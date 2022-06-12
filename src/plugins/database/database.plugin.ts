import { PrismaClient } from '@prisma/client';
import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../plugin-names.js';

export const databasePlugin = plugin(
	async (fastify) => {
		const prismaClient = new PrismaClient();

		await prismaClient.$connect();

		fastify.addHook('onClose', async () => await prismaClient.$disconnect());

		fastify.decorate('db', prismaClient);
	},
	{ name: DATABASE_PLUGIN },
);
