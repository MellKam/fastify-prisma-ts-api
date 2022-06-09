import { PrismaClient } from '@prisma/client';
import { preHandlerHookHandler } from 'fastify/types/hooks';
import { GoogleAuthService } from './auth/google/google-auth.service.js';
import { IAccessTokenPayload, JwtService } from './auth/jwt/jwt.service.js';
import { IConfig } from './config/config.service.js';
import * as decorators from './decorator-names.js';
import { HashService } from './hash/hash.service.js';
import { AxiosInstance } from 'axios';

declare module 'fastify' {
	export interface FastifyInstance {
		[decorators.CONFIG_DECORATOR]: IConfig;
		[decorators.DB_DECORATOR]: PrismaClient;
		[decorators.HASH_SERVICE_DECORATOR]: HashService;
		[decorators.JWT_SERVICE_DECORATOR]: JwtService;
		[decorators.JWT_GUARD_DECORATOR]: preHandlerHookHandler;
		[decorators.GOOGLE_AUTH_SERVICE_DECORATOR]: GoogleAuthService;
		[decorators.HTTP_CLIENT_DECORATOR]: AxiosInstance;
	}
	export interface FastifyRequest {
		[decorators.AUTH_DECORATOR]: IAccessTokenPayload | null;
	}
}
