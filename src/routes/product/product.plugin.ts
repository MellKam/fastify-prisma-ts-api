import { FastifyPluginCallback } from 'fastify';
import { ProductController } from './product.controller';
import productRoutePlugin from './product.route';
import { ProductService } from './product.service';
import plugin from 'fastify-plugin';

declare module 'fastify' {
	export interface FastifyInstance {
		productService: ProductService;
	}
}

const productPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	const productService = new ProductService(fastify.prisma.product);
	fastify.decorate('productService', productService);

	const productController = new ProductController(fastify.productService);

	fastify.register(productRoutePlugin, {
		productController,
		prefix: '/product',
	});
	done();
};

const productPlugin = plugin(productPluginCallback, { name: 'productPlugin' });

export default productPlugin;
