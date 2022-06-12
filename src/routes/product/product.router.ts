import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback } from 'fastify';
import { ProductController } from './product.controller.js';
import {
	createProductReqRef,
	productRef,
	productsArrayRef,
} from './product.schema.js';

export const productRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const productController = new ProductController(fastify.productService);

	fastify.route({
		method: 'POST',
		url: '/',
		schema: {
			body: createProductReqRef,
			response: {
				201: productRef,
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
				200: productRef,
			},
			params: Type.Object(
				{ id: Type.String({ format: 'uuid' }) },
				{ additionalProperties: false },
			),
		},
		handler: productController.findOne,
	});

	fastify.route({
		method: 'DELETE',
		url: '/:id',
		schema: {
			params: Type.Object(
				{ id: Type.String({ format: 'uuid' }) },
				{ additionalProperties: false },
			),
		},
		preHandler: fastify.jwtGuard,
		handler: productController.deleteOne,
	});

	fastify.route({
		method: 'GET',
		url: '/',
		schema: {
			response: {
				200: productsArrayRef,
			},
			querystring: Type.Object(
				{ ownerId: Type.Optional(Type.String({ format: 'uuid' })) },
				{ additionalProperties: false },
			),
		},
		handler: productController.findAll,
	});

	done();
};
