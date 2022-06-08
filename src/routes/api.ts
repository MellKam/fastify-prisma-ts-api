import { FastifyPluginCallback } from 'fastify';
import { productSchemas } from './product/product.schema.js';
import { authSchemas } from './auth/auth.schema.js';
import { userSchemas } from './user/user.schema.js';
import { authRoutePlugin, authServicePlugin } from './auth/index.js';
import { productRoutePlugin, productServicePlugin } from './product/index.js';
import { userRoutePlugin, userServicePlugin } from './user/index.js';

export const apiRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.register(authServicePlugin);
	fastify.register(productServicePlugin);
	fastify.register(userServicePlugin);

	fastify.register(authRoutePlugin, { prefix: 'auth' });
	fastify.register(productRoutePlugin, { prefix: 'product' });
	fastify.register(userRoutePlugin, { prefix: 'user' });
	done();
};

export const apiSchemas = [...authSchemas, ...productSchemas, ...userSchemas];
