import { PrismaClient } from '@prisma/client';
import { Transporter } from 'nodemailer';
import { RedisClientType } from 'redis';
import { GoogleAuthService } from '../../../plugins/auth/google/google-auth.service.js';
import { JwtService } from '../../../plugins/auth/jwt/jwt.service.js';
import { HashService } from '../../../plugins/hash/hash.service.js';
import { ActivationAuthAppService } from './activation/activation.auth.app.service.js';
import { ActivationAuthUtilService } from './activation/activation.auth.util.service.js';
import { GoogleAuthAppService } from './google.auth.app.service.js';
import { JwtAuthAppService } from './jwt.auth.app.service.js';
import { LocalAuthAppService } from './local.auth.app.service.js';

export class AuthAppService {
	readonly googleAuthAppService: GoogleAuthAppService;
	readonly jwtAuthAppService: JwtAuthAppService;
	readonly localAuthAppService: LocalAuthAppService;
	readonly activationAuthAppService: ActivationAuthAppService;

	private readonly activationAuthUtils: ActivationAuthUtilService;

	constructor(
		private readonly deps: {
			readonly redis: RedisClientType;
			readonly hashService: HashService;
			readonly jwtService: JwtService;
			readonly googleAuthService: GoogleAuthService;
			readonly userRepository: PrismaClient['user'];
			readonly localAuthRepository: PrismaClient['localAuthData'];
			readonly transporter: Transporter;
		},
		private readonly opts: {
			readonly ACTIVATION_PATH: string;
			readonly ACTIVATION_CODE_REDIS_PREFIX: string;
			readonly ACTIVATION_CODE_REDIS_TTL: string;
		},
	) {
		// UTIL_SERVICES
		this.activationAuthUtils = new ActivationAuthUtilService(
			{
				transporter: this.deps.transporter,
				redis: this.deps.redis,
			},
			{
				ACTIVATION_CODE_REDIS_PREFIX: this.opts.ACTIVATION_CODE_REDIS_PREFIX,
				ACTIVATION_CODE_REDIS_TTL: this.opts.ACTIVATION_CODE_REDIS_TTL,
				ACTIVATION_PATH: this.opts.ACTIVATION_PATH,
			},
		);

		// APP_SERVICES
		this.googleAuthAppService = new GoogleAuthAppService({
			jwtService: this.deps.jwtService,
			googleAuthService: this.deps.googleAuthService,
			userRepository: this.deps.userRepository,
		});
		this.jwtAuthAppService = new JwtAuthAppService({
			jwtService: this.deps.jwtService,
			userRepository: this.deps.userRepository,
		});
		this.localAuthAppService = new LocalAuthAppService({
			hashService: this.deps.hashService,
			jwtService: this.deps.jwtService,
			userRepository: this.deps.userRepository,
			activationAuthUtils: this.activationAuthUtils,
			localAuthRepository: this.deps.localAuthRepository,
		});
		this.activationAuthAppService = new ActivationAuthAppService({
			userRepository: this.deps.userRepository,
			utils: this.activationAuthUtils,
		});
	}
}
