import { PrismaClient } from '@prisma/client';
import { AuthService, IAccessTokenPayload } from './plugins/auth/auth.service';
import { IConfig } from './plugins/config/config.service';
import { HashService } from './plugins/hash/hash.service';
import { ProductService } from './routes/product/product.service';
import { UserService } from './routes/user/user.service';

declare module 'fastify' {
	export interface FastifyInstance {
		config: IConfig;
		prisma: PrismaClient;
		hashService: HashService;
		authService: AuthService;
		userService: UserService;
		productService: ProductService;
	}
	export interface FastifyRequest {
		auth: IAccessTokenPayload | null;
	}
}
