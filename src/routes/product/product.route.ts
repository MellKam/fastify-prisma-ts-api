import { FastifyPluginCallback } from 'fastify';
import authGuard from '../../plugins/auth/auth.guard.js';
import { ProductController } from './product.controller.js';
import {
	CREATE_PRODUCE_REQ_SCHEMA_ID,
	GET_PRODUCTS_RES_SCHEMA_ID,
	PRODUCT_SCHEMA_ID,
} from './product.schema.js';

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
			params: {
				properties: {
					id: { type: 'string' },
				},
			},
		},
		handler: opts.productController.findOne,
	});

	fastify.route({
		method: 'DELETE',
		url: '/:id',
		schema: {
			params: {
				properties: {
					id: { type: 'string' },
				},
			},
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
			querystring: {
				properties: {
					ownerId: { type: 'string' },
				},
			},
		},
		handler: opts.productController.findAll,
	});

	done();
};

export default productRoutePlugin;
