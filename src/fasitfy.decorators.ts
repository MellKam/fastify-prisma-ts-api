import { PrismaClient } from '@prisma/client';
import {
	AuthService,
	IAccessTokenPayload,
} from './plugins/auth/auth.service.js';
import { IConfig } from './plugins/config/config.service.js';
import { HashService } from './plugins/hash/hash.service.js';

declare module 'fastify' {
	export interface FastifyInstance {
		config: IConfig;
		db: PrismaClient;
		hashService: HashService;
		authService: AuthService;
	}
	export interface FastifyRequest {
		auth: IAccessTokenPayload | null;
	}
}
