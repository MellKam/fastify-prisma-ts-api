import { PrismaClient } from '@prisma/client';
import { preHandlerHookHandler } from 'fastify/types/hooks';
import { IAccessTokenPayload, JwtService } from './auth/jwt/jwt.service.js';
import { IConfig } from './config/config.service.js';
import * as decorators from './decorator-names.js';
import { HashService } from './hash/hash.service.js';

declare module 'fastify' {
	export interface FastifyInstance {
		[decorators.CONFIG_DECORATOR]: IConfig;
		[decorators.DB_DECORATOR]: PrismaClient;
		[decorators.HASH_SERVICE_DECORATOR]: HashService;
		[decorators.JWT_SERVICE_DECORATOR]: JwtService;
		[decorators.JWT_GUARD_DECORATOR]: preHandlerHookHandler;
	}
	export interface FastifyRequest {
		[decorators.AUTH_DECORATOR]: IAccessTokenPayload | null;
	}
}
