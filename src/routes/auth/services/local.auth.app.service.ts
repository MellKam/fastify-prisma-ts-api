import { PrismaClient } from '@prisma/client';
import { JwtService } from '../../../plugins/auth/jwt/jwt.service.js';
import { HashService } from '../../../plugins/hash/hash.service.js';
import {
	BadRequestError,
	InternalServerError,
} from '../../../utils/http-errors.js';
import { localLoginReqType, localRegisterReqType } from '../auth.schema.js';
import { ActivationAuthUtilService } from './activation/activation.auth.util.service.js';

export class LocalAuthAppService {
	constructor(
		private readonly deps: {
			readonly userRepository: PrismaClient['user'];
			readonly localAuthRepository: PrismaClient['localAuthData'];
			readonly jwtService: JwtService;
			readonly hashService: HashService;
			readonly activationAuthUtils: ActivationAuthUtilService;
		},
	) {}

	private async localRegisterExistingUser(userId: string, password: string) {
		const { hash, salt } = await this.deps.hashService.hashPassword(password);

		const localAuthData = await this.deps.localAuthRepository.create({
			data: { hash, salt },
		});

		return await this.deps.userRepository.update({
			where: { id: userId },
			data: { localAuthId: localAuthData.id },
		});
	}

	async localRegister(data: localRegisterReqType) {
		try {
			const exisingUser = await this.deps.userRepository.findUnique({
				where: { email: data.email },
			});

			if (exisingUser !== null) {
				if (exisingUser.localAuthId) {
					return new BadRequestError('User with this email already exist');
				}

				return await this.localRegisterExistingUser(
					exisingUser.id,
					data.password,
				);
			}

			const { password, ...userData } = data;
			const { hash, salt } = await this.deps.hashService.hashPassword(password);

			const localAuthData = await this.deps.localAuthRepository.create({
				data: { hash, salt },
			});

			const user = await this.deps.userRepository.create({
				data: {
					...userData,
					localAuthId: localAuthData.id,
				},
			});

			this.deps.activationAuthUtils.sendActivationMail(user.email);

			return user;
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async localLogin(data: localLoginReqType) {
		try {
			const user = await this.deps.userRepository.findUnique({
				where: { email: data.email },
				include: { localAuthData: true },
			});

			if (user === null) {
				throw new BadRequestError('User with this email not exist');
			}
			if (!user.localAuthData) {
				throw new BadRequestError('User does not have localAuth method');
			}

			const isPasswordValid = await this.deps.hashService.validatePassword(
				data.password,
				user.localAuthData.hash,
				user.localAuthData.salt,
			);

			if (!isPasswordValid) {
				throw new BadRequestError(`Invalid password for user ${data.email}`);
			}

			await this.deps.userRepository.update({
				where: { id: user.id },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.deps.jwtService.generateKeyPair({
				isActivated: user.isActiveted,
				tokenVersion: user.tokenVersion++,
				userId: user.id,
			});
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}
}
