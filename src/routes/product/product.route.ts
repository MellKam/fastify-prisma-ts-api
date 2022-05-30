import { FastifyPluginCallback } from 'fastify';
import { ProductController } from './product.controller';
import {
	CREATE_PRODUCE_REQ_SCHEMA_ID,
	GET_PRODUCTS_RES_SCHEMA_ID,
	PRODUCT_SCHEMA_ID,
} from './product.schema';

const productRoutePlugin: FastifyPluginCallback<{
	productController: ProductController;
}> = (fastify, opts, done) => {
	fastify.post(
		'/',
		{
			schema: {
				body: { $ref: CREATE_PRODUCE_REQ_SCHEMA_ID },
				response: {
					201: { $ref: PRODUCT_SCHEMA_ID },
				},
			},
		},
		opts.productController.create,
	);

	fastify.get(
		'/:id',
		{
			schema: {
				response: {
					200: { $ref: PRODUCT_SCHEMA_ID },
				},
			},
		},
		opts.productController.findOne,
	);

	fastify.delete(
		'/:id',
		{ schema: { response: { 200: { $ref: PRODUCT_SCHEMA_ID } } } },
		opts.productController.deleteOne,
	);

	fastify.get(
		'/',
		{
			schema: {
				response: {
					200: { $ref: GET_PRODUCTS_RES_SCHEMA_ID },
				},
			},
		},
		opts.productController.findAll,
	);

	done();
};

export default productRoutePlugin;
