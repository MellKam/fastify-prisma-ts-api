import { FastifyPluginCallback } from 'fastify';
import { ProductController } from './product.controller.js';
import {
	CREATE_PRODUCE_REQ_SCHEMA_ID,
	GET_PRODUCTS_RES_SCHEMA_ID,
	PRODUCT_SCHEMA_ID,
} from './product.schema.js';

export const productRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const productController = new ProductController(fastify.productService);

	fastify.route({
		method: 'POST',
		url: '/',
		schema: {
			body: { $ref: CREATE_PRODUCE_REQ_SCHEMA_ID },
			response: {
				201: { $ref: PRODUCT_SCHEMA_ID },
			},
		},
		preHandler: fastify.jwtGuard,
		handler: productController.create,
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
		handler: productController.findOne,
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
		preHandler: fastify.jwtGuard,
		handler: productController.deleteOne,
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
		handler: productController.findAll,
	});

	done();
};
