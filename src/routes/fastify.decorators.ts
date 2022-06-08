import { AuthService } from './auth/auth.service.js';
import { ProductService } from './product/product.service.js';
import * as services from './service-names.js';
import { UserService } from './user/user.service.js';

declare module 'fastify' {
	export interface FastifyInstance {
		[services.AUTH_SERVICE]: AuthService;
		[services.PRODUCT_SERVICE]: ProductService;
		[services.USER_SERVICE]: UserService;
	}
}
