import { PrismaClient } from '@prisma/client';
import { preHandlerHookHandler } from 'fastify/types/hooks';
import { GoogleAuthService } from './auth/google/google-auth.service.js';
import { AccessTokenPayload, JwtService } from './auth/jwt/jwt.service.js';
import { HashService } from './hash/hash.service.js';
import { AxiosInstance } from 'axios';
import { AppConfig } from './config/config.schema.js';
import { RedisClientType } from 'redis';
import { Transporter } from 'nodemailer';

declare module 'fastify' {
	export interface FastifyInstance {
		config: AppConfig;
		prisma: PrismaClient;
		hashService: HashService;
		jwtService: JwtService;
		jwtGuard: preHandlerHookHandler;
		googleAuthService: GoogleAuthService;
		axios: AxiosInstance;
		transporter: Transporter;
		redis: RedisClientType;
	}
	export interface FastifyRequest {
		auth: AccessTokenPayload | null;
	}
}
