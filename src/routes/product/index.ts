import { FastifyPluginCallback } from 'fastify';
import { ProductService } from './product.service.js';
import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../../plugins/plugin-names.js';
import { productRouter } from './product.router.js';
import { PRODUCT_SERVICE } from '../service-names.js';

const productServiceCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	fastify.decorate(PRODUCT_SERVICE, new ProductService(fastify.prisma.product));

	done();
};

export const productServicePlugin = plugin(productServiceCallback, {
	name: PRODUCT_SERVICE,
	dependencies: [DATABASE_PLUGIN],
});

export const productRoutePlugin = plugin<{ prefix: string }>(
	async (fastify, opts) => {
		await fastify.register(productRouter, { prefix: opts.prefix });
	},
	{
		dependencies: [PRODUCT_SERVICE],
	},
);
