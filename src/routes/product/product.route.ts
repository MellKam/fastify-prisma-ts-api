import { FastifyPluginCallback } from 'fastify';
import authGuard from '../../plugins/auth/auth.guard';
import { ProductController } from './product.controller';
import {
	CREATE_PRODUCE_REQ_SCHEMA_ID,
	GET_PRODUCTS_QUERY_SCHEMA,
	GET_PRODUCTS_RES_SCHEMA_ID,
	PRODUCT_SCHEMA_ID,
} from './product.schema';

const productRoutePlugin: FastifyPluginCallback<{
	productController: ProductController;
}> = (fastify, opts, done) => {
	fastify.route({
		method: 'POST',
		url: '/',
		schema: {
			body: { $ref: CREATE_PRODUCE_REQ_SCHEMA_ID },
			response: {
				201: { $ref: PRODUCT_SCHEMA_ID },
			},
		},
		preHandler: authGuard,
		handler: opts.productController.create,
	});

	fastify.route({
		method: 'GET',
		url: '/:id',
		schema: {
			response: {
				200: { $ref: PRODUCT_SCHEMA_ID },
			},
			//TODO :id parameter validation
		},
		handler: opts.productController.findOne,
	});

	fastify.route({
		method: 'DELETE',
		url: '/:id',
		schema: {
			response: { 200: { $ref: PRODUCT_SCHEMA_ID } },
			// TODO :id parameter validation
		},
		preHandler: authGuard,
		handler: opts.productController.deleteOne,
	});

	fastify.route({
		method: 'GET',
		url: '/',
		schema: {
			response: {
				200: { $ref: GET_PRODUCTS_RES_SCHEMA_ID },
			},
			querystring: { $ref: GET_PRODUCTS_QUERY_SCHEMA },
		},
		handler: opts.productController.findAll,
	});

	done();
};

export default productRoutePlugin;
