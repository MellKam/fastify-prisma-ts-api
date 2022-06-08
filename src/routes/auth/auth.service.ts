import { PrismaClient } from '@prisma/client';
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
import { IRegisterUserReq, ILoginUserReq } from './auth.schema.js';

export class AuthService {
	constructor(
		private readonly userRepository: PrismaClient['user'],
		private readonly authService: JwtService,
		private readonly hashService: HashService,
	) {}

	async register(data: IRegisterUserReq) {
		try {
			const exisingUser = await this.userRepository.findUnique({
				where: { email: data.email },
			});
			if (exisingUser !== null) {
				return new BadRequestError('User with this email already exist');
			}

			const { password, ...userData } = data;
			const { hash, salt } = await this.hashService.hashPassword(password);

			return await this.userRepository.create({
				data: { ...userData, password: hash, salt },
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async login(data: ILoginUserReq) {
		try {
			let user = await this.userRepository.findUnique({
				where: { email: data.email },
			});
			if (user === null) {
				return new BadRequestError('User with this email not exist');
			}

			const isPasswordValid = await this.hashService.validatePassword(
				data.password,
				user.password,
				user.salt,
			);

			if (!isPasswordValid) {
				return new BadRequestError(`Invalid password for user ${data.email}`);
			}

			user = await this.userRepository.update({
				where: { id: user.id },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.authService.generateKeyPair(user.id, user.tokenVersion);
		} catch (error: any) {
			return new InternalServerError(error.msg);
		}
	}

	async refreshAccessToken(refreshToken: string) {
		try {
			const refreshTokenPayload = this.authService.getTokenPayload(
				refreshToken,
			) as IRefreshTokenPayload | null;
			if (refreshTokenPayload === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			const user = await this.userRepository.findUnique({
				where: { id: refreshTokenPayload.userId },
			});
			if (user === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			return this.authService.generateAccessToken({ userId: user.id });
		} catch (error: any) {
			throw new InternalServerError(error.message);
		}
	}

	async revokeRefreshToken(refreshToken: string) {
		try {
			const refreshTokenPayload = this.authService.getTokenPayload(
				refreshToken,
			) as IRefreshTokenPayload | null;
			if (refreshTokenPayload === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			const user = await this.userRepository.update({
				where: { id: refreshTokenPayload.userId },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.authService.generateRefreshToken({
				tokenVersion: user.tokenVersion,
				userId: user.id,
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
