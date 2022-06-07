import { FastifyPluginCallback } from 'fastify';
import productPlugin from './product/product.plugin.js';
import { productSchemas } from './product/product.schema.js';
import userPlugin from './user/user.plugin.js';
import { userSchemas } from './user/user.schema.js';

export const apiPlugin: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.register(userPlugin);
	fastify.register(productPlugin);
	done();
};

export const apiSchemas = [...userSchemas, ...productSchemas];
