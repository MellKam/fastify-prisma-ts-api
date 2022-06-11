import { PrismaClient } from '@prisma/client';
import { GoogleAuthService } from '../../plugins/auth/google/google-auth.service.js';
import { GoogleUserInfo } from '../../plugins/auth/google/google-auth.types.js';
import {
	IRefreshTokenPayload,
	JwtService,
} from '../../plugins/auth/jwt/jwt.service.js';
import { HashService } from '../../plugins/hash/hash.service.js';
import {
	BadRequestError,
	InternalServerError,
	UnauthorizedError,
} from '../../utils/http-errors.js';
import { localLoginReqType, localRegisterReqType } from './auth.schema.js';

export class AuthService {
	constructor(
		private readonly userRepository: PrismaClient['user'],
		private readonly localAuthRepository: PrismaClient['localAuthData'],
		private readonly jwtService: JwtService,
		private readonly hashService: HashService,
		private readonly googleAuthService: GoogleAuthService,
	) {}

	async localRegister(data: localRegisterReqType) {
		try {
			const exisingUser = await this.userRepository.findUnique({
				where: { email: data.email },
			});
			if (exisingUser !== null) {
				if (!exisingUser.localAuthId) {
					// ??? Maybe put adding auth method in a separate route
					const { password } = data;
					const { hash, salt } = await this.hashService.hashPassword(password);

					const localAuthData = await this.localAuthRepository.create({
						data: { hash, salt },
					});

					return await this.userRepository.update({
						where: { id: exisingUser.id },
						data: { localAuthId: localAuthData.id },
					});
				}
				return new BadRequestError('User with this email already exist');
			}

			const { password, ...userData } = data;
			const { hash, salt } = await this.hashService.hashPassword(password);

			const localAuthData = await this.localAuthRepository.create({
				data: { hash, salt },
			});

			return await this.userRepository.create({
				data: {
					...userData,
					localAuthId: localAuthData.id,
				},
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async localLogin(data: localLoginReqType) {
		try {
			const user = await this.userRepository.findUnique({
				where: { email: data.email },
				include: { localAuthData: true },
			});
			if (user === null) {
				return new BadRequestError('User with this email not exist');
			}

			if (!user.localAuthData) {
				return new BadRequestError('User does not have localAuth method');
			}

			const isPasswordValid = await this.hashService.validatePassword(
				data.password,
				user.localAuthData.hash,
				user.localAuthData.salt,
			);

			if (!isPasswordValid) {
				return new BadRequestError(`Invalid password for user ${data.email}`);
			}

			await this.userRepository.update({
				where: { id: user.id },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.jwtService.generateKeyPair(user.id, user.tokenVersion++);
		} catch (error: any) {
			return new InternalServerError(error.msg);
		}
	}

	async refreshAccessToken(refreshToken: string) {
		try {
			const refreshTokenPayload =
				this.jwtService.verifyToken<IRefreshTokenPayload>(refreshToken);
			if (refreshTokenPayload === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			const user = await this.userRepository.findUnique({
				where: { id: refreshTokenPayload.userId },
			});
			if (user === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			return this.jwtService.generateAccessToken({ userId: user.id });
		} catch (error: any) {
			throw new InternalServerError(error.message);
		}
	}

	getGoogleAuthUrl() {
		return this.googleAuthService.getGoogleAuthUrl();
	}

	async getGoogleUserByCode(code: string) {
		const googleResponse = await this.googleAuthService.verifyUserCode(code);

		const googleUser = this.jwtService.decodeToken<GoogleUserInfo>(
			googleResponse.id_token,
		);
		if (googleUser === null) {
			throw new InternalServerError('Cannot decode user token');
		}

		if (!googleUser.email_verified) {
			throw new BadRequestError('User email not verified');
		}

		return googleUser;
	}

	async loginOrRegisterUserWithGoogle(code: string): Promise<{
		userId: string;
		tokenVersion: number;
	}> {
		try {
			const googleUserInfo = await this.getGoogleUserByCode(code);

			const existingUser = await this.userRepository.findUnique({
				where: { email: googleUserInfo.email },
			});

			if (existingUser !== null) {
				if (existingUser.googleSub === null) {
					const user = await this.userRepository.update({
						where: { id: existingUser.id },
						data: {
							googleSub: googleUserInfo.sub,
							locale: existingUser.locale ? undefined : googleUserInfo.locale,
							name: existingUser.name ? undefined : googleUserInfo.name,
							tokenVersion: { increment: 1 },
						},
					});

					return { userId: user.id, tokenVersion: user.tokenVersion };
				}

				await this.userRepository.update({
					where: { id: existingUser.id },
					data: { tokenVersion: { increment: 1 } },
				});

				return {
					userId: existingUser.id,
					tokenVersion: existingUser.tokenVersion++,
				};
			}

			const user = await this.userRepository.create({
				data: {
					email: googleUserInfo.email,
					googleSub: googleUserInfo.sub,
					locale: googleUserInfo.locale,
					name: googleUserInfo.name,
					tokenVersion: 1,
				},
			});

			return { userId: user.id, tokenVersion: user.tokenVersion };
		} catch (error: any) {
			throw new InternalServerError(error.message);
		}
	}

	async getJwtKeypairWithGoogleCode(code: string) {
		const result = await this.loginOrRegisterUserWithGoogle(code);

		return this.jwtService.generateKeyPair(result.userId, result.tokenVersion);
	}

	async logout(userId: string) {
		try {
			await this.userRepository.update({
				where: { id: userId },
				data: { tokenVersion: { increment: 1 } },
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
