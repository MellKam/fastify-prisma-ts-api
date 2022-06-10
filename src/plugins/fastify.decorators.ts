import { PrismaClient } from '@prisma/client';
import { preHandlerHookHandler } from 'fastify/types/hooks';
import { GoogleAuthService } from './auth/google/google-auth.service.js';
import { IAccessTokenPayload, JwtService } from './auth/jwt/jwt.service.js';
import { HashService } from './hash/hash.service.js';
import { AxiosInstance } from 'axios';
import { AppConfig } from './config/config.schema.js';

declare module 'fastify' {
	export interface FastifyInstance {
		config: AppConfig;
		db: PrismaClient;
		hashService: HashService;
		jwtService: JwtService;
		jwtGuard: preHandlerHookHandler;
		googleAuthService: GoogleAuthService;
		axios: AxiosInstance;
	}
	export interface FastifyRequest {
		auth: IAccessTokenPayload | null;
	}
}
