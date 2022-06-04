import { Prisma } from '@prisma/client';
import {
	AuthService,
	IRefreshTokenPayload,
} from '../../plugins/auth/auth.service.js';
import { HashService } from '../../plugins/hash/hash.service.js';
import { ConflictError, InternalServerError } from '../../utils/http-errors.js';
import { ICreateUserReq, ILoginUserReq } from './user.schema.js';

export class UserService {
	constructor(
		private readonly userRepository: Prisma.UserDelegate<undefined>,
		private readonly authService: AuthService,
		private readonly hashService: HashService,
	) {}

	async register(data: ICreateUserReq) {
		try {
			const exisingUser = await this.userRepository.findUnique({
				where: { email: data.email },
			});
			if (exisingUser !== null) {
				return new ConflictError('User with this email already exist');
			}

			const { password, ...userData } = data;
			const { hash, salt } = await this.hashService.hashPassword(password);

			return await this.userRepository.create({
				data: { ...userData, password: hash, salt },
			});
		} catch (error) {
			return new InternalServerError();
		}
	}

	async login(data: ILoginUserReq) {
		try {
			let user = await this.userRepository.findUnique({
				where: { email: data.email },
			});
			if (user === null) {
				return new ConflictError('User with this email not exist');
			}

			const isPasswordValid = await this.hashService.validatePassword(
				data.password,
				user.password,
				user.salt,
			);

			if (!isPasswordValid) {
				return new ConflictError(`Invalid password for user ${data.email}`);
			}

			user = await this.userRepository.update({
				where: { id: user.id },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.authService.generateKeyPair(user.id, user.tokenVersion);
		} catch (error) {
			return new InternalServerError();
		}
	}

	async refreshAccessToken(refreshToken: string) {
		try {
			const refreshTokenPayload = this.authService.getTokenPayload(
				refreshToken,
			) as IRefreshTokenPayload | null;
			if (refreshTokenPayload === null) {
				return new ConflictError('Invalid refresh token');
			}

			const user = await this.userRepository.findUnique({
				where: { id: refreshTokenPayload.userId },
			});
			if (user === null) {
				return new ConflictError('Invalid refresh token');
			}

			return this.authService.generateAccessToken({ userId: user.id });
		} catch (error) {
			throw new InternalServerError();
		}
	}

	async revokeRefreshToken(refreshToken: string) {
		try {
			const refreshTokenPayload = this.authService.getTokenPayload(
				refreshToken,
			) as IRefreshTokenPayload | null;
			if (refreshTokenPayload === null) {
				return new ConflictError('Invalid refresh token');
			}

			const user = await this.userRepository.update({
				where: { id: refreshTokenPayload.userId },
				data: { tokenVersion: { increment: 1 } },
			});

			return this.authService.generateRefreshToken({
				tokenVersion: user.tokenVersion,
				userId: user.id,
			});
		} catch (error) {
			return new InternalServerError();
		}
	}

	async getUser(id: number) {
		try {
			const user = await this.userRepository.findUnique({ where: { id } });

			if (user === null) {
				return new ConflictError('User with this id does not exist');
			}
			return user;
		} catch (error) {
			return new InternalServerError(error);
		}
	}
}
