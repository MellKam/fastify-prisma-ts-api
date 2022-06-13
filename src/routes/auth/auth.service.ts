import { PrismaClient } from '@prisma/client';
import { Transporter } from 'nodemailer';
import { GoogleAuthService } from '../../plugins/auth/google/google-auth.service.js';
import { GoogleUserInfo } from '../../plugins/auth/google/google-auth.types.js';
import {
	RefreshTokenPayload,
	JwtService,
} from '../../plugins/auth/jwt/jwt.service.js';
import { HashService } from '../../plugins/hash/hash.service.js';
import {
	BadRequestError,
	InternalServerError,
	UnauthorizedError,
} from '../../utils/http-errors.js';
import { localLoginReqType, localRegisterReqType } from './auth.schema.js';
import { randomUUID } from 'crypto';
import type { RedisClientType } from 'redis';
import ms from 'ms';

interface AuthServiceOptions {
	readonly userRepository: PrismaClient['user'];
	readonly localAuthRepository: PrismaClient['localAuthData'];
	readonly jwtService: JwtService;
	readonly hashService: HashService;
	readonly googleAuthService: GoogleAuthService;
	readonly transporter: Transporter;
	readonly ACTIVATION_PATH: string;
	readonly redis: RedisClientType;
}

export class AuthService {
	readonly ACTIVATION_CODE_PREFIX = 'activation_code_';

	constructor(private readonly opts: AuthServiceOptions) {}

	private async sendActivationMail(email: string) {
		const activationCode = randomUUID();
		await this.opts.redis.setEx(
			this.ACTIVATION_CODE_PREFIX + activationCode,
			ms('15 min'),
			email,
		);

		// not await this operation, because its took so long
		// and we not required response from it
		this.opts.transporter.sendMail({
			to: email,
			subject: 'Account activation',
			html: `<a href="${this.opts.ACTIVATION_PATH}?code=${activationCode}">Activate account</a>`,
		});
	}

	async activateAccountByCode(code: string) {
		try {
			// prefix_code(key) -> user email(value)
			const email = await this.opts.redis.get(
				this.ACTIVATION_CODE_PREFIX + code,
			);
			if (!email) {
				throw new BadRequestError('Invalid actiavtion code');
			}

			const result = await this.opts.userRepository.updateMany({
				where: { email, isActiveted: false },
				data: { isActiveted: true },
			});

			return result.count !== 0;
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}

	async localRegisterExistingUser(userId: string, password: string) {
		const { hash, salt } = await this.opts.hashService.hashPassword(password);

		const localAuthData = await this.opts.localAuthRepository.create({
			data: { hash, salt },
		});

		return await this.opts.userRepository.update({
			where: { id: userId },
			data: { localAuthId: localAuthData.id },
		});
	}

	async localRegister(data: localRegisterReqType) {
		try {
			const exisingUser = await this.opts.userRepository.findUnique({
				where: { email: data.email },
			});

			if (exisingUser !== null) {
				if (exisingUser.localAuthId) {
					return new BadRequestError('User with this email already exist');
				}

				await this.localRegisterExistingUser(data.password, exisingUser.id);
			}

			const { password, ...userData } = data;
			const { hash, salt } = await this.opts.hashService.hashPassword(password);

			const localAuthData = await this.opts.localAuthRepository.create({
				data: { hash, salt },
			});

			const user = await this.opts.userRepository.create({
				data: {
					...userData,
					localAuthId: localAuthData.id,
				},
			});

			await this.sendActivationMail(user.email);

			return user;
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async localLogin(data: localLoginReqType) {
		try {
			const user = await this.opts.userRepository.findUnique({
				where: { email: data.email },
				include: { localAuthData: true },
			});

			if (user === null) {
				throw new BadRequestError('User with this email not exist');
			}
			if (!user.localAuthData) {
				throw new BadRequestError('User does not have localAuth method');
			}

			const isPasswordValid = await this.opts.hashService.validatePassword(
				data.password,
				user.localAuthData.hash,
				user.localAuthData.salt,
			);

			if (!isPasswordValid) {
				throw new BadRequestError(`Invalid password for user ${data.email}`);
			}

			return await this.loginUserById(user.id);
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}

	async refreshAccessToken(refreshToken: string) {
		try {
			const refreshTokenPayload =
				this.opts.jwtService.verifyToken<RefreshTokenPayload>(refreshToken);
			if (refreshTokenPayload === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			const user = await this.opts.userRepository.findUnique({
				where: { id: refreshTokenPayload.userId },
			});
			if (user === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			return this.opts.jwtService.generateAccessToken({ userId: user.id });
		} catch (error: any) {
			throw new InternalServerError(error.message);
		}
	}

	private async loginUserById(id: string) {
		const user = await this.opts.userRepository.update({
			where: { id },
			data: { tokenVersion: { increment: 1 } },
		});

		return this.opts.jwtService.generateKeyPair(user.id, user.tokenVersion);
	}

	// alias for GoogleAuthService method
	// made so that controller only depends on the service
	getGoogleAuthUrl() {
		return this.opts.googleAuthService.getGoogleAuthUrl();
	}

	private async getGoogleUserByCode(code: string) {
		const googleResponse = await this.opts.googleAuthService.verifyUserCode(
			code,
		);
		// we trust Google so we can just decode this token
		const googleUser = this.opts.jwtService.decodeToken<GoogleUserInfo>(
			googleResponse.id_token,
		);

		if (googleUser === null) {
			throw new InternalServerError('Cannot decode user token');
		}
		return googleUser;
	}

	/**
	 * Fetch google user by code and login it if account already exists
	 * if the account doesn't exit, register new user and login to it
	 *
	 * @param code
	 * Google Authorization code
	 *
	 * @returns refresh and access token
	 */
	async loginWithGoogle(code: string) {
		try {
			const googleUser = await this.getGoogleUserByCode(code);

			if (!googleUser.email_verified) {
				throw new BadRequestError('User email not verified');
			}

			const existingUser = await this.opts.userRepository.findUnique({
				where: { email: googleUser.email },
			});

			if (existingUser !== null) {
				if (existingUser.googleSub === null) {
					// add to user googleAuth data
					await this.opts.userRepository.update({
						where: { id: existingUser.id },
						data: {
							googleSub: googleUser.sub,
							// if user don't have setted this data, then set it from google
							locale: existingUser.locale ? undefined : googleUser.locale,
							name: existingUser.name ? undefined : googleUser.name,
							// increment token to login user and revoke latest tokens
							tokenVersion: { increment: 1 },
						},
					});

					return this.opts.jwtService.generateKeyPair(
						existingUser.id,
						existingUser.tokenVersion++,
					);
				}

				// login existing user with google
				return await this.loginUserById(existingUser.id);
			}

			// register new user with google
			const user = await this.opts.userRepository.create({
				data: {
					email: googleUser.email,
					googleSub: googleUser.sub,
					locale: googleUser.locale,
					name: googleUser.name,
					// increment token to login user and revoke latest tokens
					tokenVersion: 1,
				},
			});

			return this.opts.jwtService.generateKeyPair(user.id, user.tokenVersion);
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}

	async logout(userId: string) {
		try {
			// increment tokenVersion to revoke old token
			await this.opts.userRepository.update({
				where: { id: userId },
				data: { tokenVersion: { increment: 1 } },
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
