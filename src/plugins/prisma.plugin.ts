import { PrismaClient } from '@prisma/client';
import plugin from 'fastify-plugin';

declare module 'fastify' {
	export interface FastifyInstance {
		prisma: PrismaClient;
	}
}

export const PRISMA_PLUGIN = 'prismaPlugin';

export const prismaPlugin = plugin(
	async (fastify, _opts) => {
		const prisma = new PrismaClient();

		await prisma.$connect();
		fastify.decorate('prisma', prisma);

		fastify.addHook('onClose', prisma.$disconnect);
	},
	{ name: PRISMA_PLUGIN },
);
