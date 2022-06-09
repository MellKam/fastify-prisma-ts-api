import { FastifyPluginAsync } from 'fastify';
import { productSchemas } from './product/product.schema.js';
import { authSchemas } from './auth/auth.schema.js';
import { userSchemas } from './user/user.schema.js';
import { authRoutePlugin, authServicePlugin } from './auth/index.js';
import { productRoutePlugin, productServicePlugin } from './product/index.js';
import { userRoutePlugin, userServicePlugin } from './user/index.js';

export const apiRouter: FastifyPluginAsync = async (fastify, _opts) => {
	await fastify.register(authServicePlugin);
	await fastify.register(productServicePlugin);
	await fastify.register(userServicePlugin);

	await fastify.register(authRoutePlugin, { prefix: 'auth' });
	await fastify.register(productRoutePlugin, { prefix: 'product' });
	await fastify.register(userRoutePlugin, { prefix: 'user' });
};

export const apiSchemas = [...authSchemas, ...productSchemas, ...userSchemas];
