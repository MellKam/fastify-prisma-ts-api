import { randomUUID } from 'crypto';
import ms from 'ms';
import { RedisClientType } from 'redis';
import { BadRequestError } from '../../../../utils/http-errors.js';
import { EmailActivationAuthUtilService } from './email-activation.auth.util.service.js';

export class ActivationAuthUtilService {
	constructor(
		private readonly deps: {
			readonly redis: RedisClientType;
			readonly emailUtils: EmailActivationAuthUtilService;
		},
		private readonly opts: {
			readonly ACTIVATION_CODE_REDIS_PREFIX: string;
			readonly ACTIVATION_CODE_REDIS_TTL: string;
		},
	) {}

	/**
	 * Generate activation code in format of uuid
	 * and set it to redis as key with with value of user email
	 */
	async genActivationCode(email: string) {
		const activationCode = randomUUID();

		await this.deps.redis.setEx(
			this.opts.ACTIVATION_CODE_REDIS_PREFIX + activationCode,
			ms(this.opts.ACTIVATION_CODE_REDIS_TTL),
			email,
		);

		return activationCode;
	}

	async findUserEmailByCode(code: string) {
		const email = await this.deps.redis.get(
			this.opts.ACTIVATION_CODE_REDIS_PREFIX + code,
		);

		if (!email) {
			throw new BadRequestError('Invalid actiavtion code');
		}
		return email;
	}

	async sendActivationMail(userEmail: string) {
		const code = await this.genActivationCode(userEmail);
		this.deps.emailUtils.sendActivationMail(userEmail, code);
	}
}
