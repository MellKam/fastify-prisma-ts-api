import { PrismaClient } from '@prisma/client';
import plugin from 'fastify-plugin';

export const PRISMA_PLUGIN = 'prismaPlugin';

export const prismaPlugin = plugin(
	async (fastify, _opts) => {
		const prisma = new PrismaClient();

		try {
			await prisma.$connect();
		} catch (error) {
			fastify.log.error('PrismaClient cannot connect to database');
			throw error;
		}

		fastify.decorate('prisma', prisma);

		fastify.addHook('onClose', prisma.$disconnect);
	},
	{ name: PRISMA_PLUGIN },
);
