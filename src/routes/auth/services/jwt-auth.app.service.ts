import { PrismaClient } from '@prisma/client';
import {
	JwtService,
	RefreshTokenPayload,
} from '../../../plugins/auth/jwt/jwt.service.js';
import {
	UnauthorizedError,
	InternalServerError,
} from '../../../utils/http-errors.js';

export class JwtAuthAppService {
	constructor(
		private readonly deps: {
			readonly userRepository: PrismaClient['user'];
			readonly jwtService: JwtService;
		},
	) {}

	async refreshAccessToken(refreshToken: string) {
		try {
			const refreshTokenPayload =
				this.deps.jwtService.verifyToken<RefreshTokenPayload>(refreshToken);
			if (refreshTokenPayload === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			const user = await this.deps.userRepository.findUnique({
				where: { id: refreshTokenPayload.userId },
			});
			if (user === null) {
				return new UnauthorizedError('Invalid refresh token');
			}

			return this.deps.jwtService.generateAccessToken({
				userId: user.id,
				isActivated: user.isActiveted,
			});
		} catch (error: any) {
			throw new InternalServerError(error.message);
		}
	}

	async logout(userId: string) {
		try {
			// increment tokenVersion to revoke old token
			await this.deps.userRepository.update({
				where: { id: userId },
				data: { tokenVersion: { increment: 1 } },
			});
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
