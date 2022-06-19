import plugin from 'fastify-plugin';
import prismaClient from './prisma-client.js';

export const prismaPlugin = plugin(
	async (fastify) => {
		await prismaClient.$connect();

		fastify.addHook('onClose', async () => await prismaClient.$disconnect());

		fastify.decorate('prisma', prismaClient);
	},
	{ name: 'prismaPlugin' },
);
