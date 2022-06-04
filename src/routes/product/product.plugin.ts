import { FastifyPluginCallback } from 'fastify';
import { ProductController } from './product.controller.js';
import productRoutePlugin from './product.route.js';
import { ProductService } from './product.service.js';
import plugin from 'fastify-plugin';
import { DATABASE_PLUGIN } from '../../plugins/plugin-names.js';

declare module 'fastify' {
	export interface FastifyInstance {
		productService: ProductService;
	}
}

const productPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const productService = new ProductService(fastify.db.product);
	fastify.decorate('productService', productService);

	const productController = new ProductController(fastify.productService);

	fastify.register(productRoutePlugin, {
		productController,
		prefix: '/product',
	});
	done();
};

const productPlugin = plugin(productPluginCallback, {
	dependencies: [DATABASE_PLUGIN],
});

export default productPlugin;
