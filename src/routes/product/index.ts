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
	const productService = new ProductService(fastify.db.product);
	fastify.decorate(PRODUCT_SERVICE, productService);

	done();
};

export const productServicePlugin = plugin(productServiceCallback, {
	name: PRODUCT_SERVICE,
	dependencies: [DATABASE_PLUGIN],
});

const productRouteCallback: FastifyPluginCallback<{ prefix: string }> = (
	fastify,
	opts,
	done,
) => {
	fastify.register(productRouter, { prefix: opts.prefix });
	done();
};

export const productRoutePlugin = plugin(productRouteCallback, {
	dependencies: [PRODUCT_SERVICE],
});