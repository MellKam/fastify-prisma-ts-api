import { PrismaClient } from '@prisma/client';
import {
	BadRequestError,
	InternalServerError,
} from '../../../../utils/http-errors.js';
import { ActivationAuthUtilService } from './activation.auth.util.service.js';

export class ActivationAuthAppService {
	constructor(
		private readonly deps: {
			userRepository: PrismaClient['user'];
			utils: ActivationAuthUtilService;
		},
	) {}

	async resendActivationMail(email: string) {
		try {
			const user = await this.deps.userRepository.findFirst({
				where: { email, isActivated: false },
			});
			if (user === null) {
				throw new BadRequestError(
					`User with email "${email}" does not exist or always has an activated account`,
				);
			}

			// TODO limit maximum number of sended mails per day to user

			this.deps.utils.sendActivationMail(user.email);
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}

	async activateAccountByCode(code: string) {
		try {
			const email = await this.deps.utils.findUserEmailByCode(code);

			const result = await this.deps.userRepository.updateMany({
				where: { email, isActivated: false },
				data: { isActivated: true },
			});

			return result.count !== 0;
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}
}
