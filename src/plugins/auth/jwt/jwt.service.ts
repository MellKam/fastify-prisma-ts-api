import type jwt from 'jsonwebtoken';

type JsonWebToken = typeof jwt;

export interface IRefreshTokenPayload {
	userId: string;
	tokenVersion: number;
}

export interface IAccessTokenPayload {
	userId: string;
}

interface JwtServiceConfig {
	readonly JWT_SECRET: string;
	readonly REFRESH_TOKEN_EXPIRES_TIME: string;
	readonly ACCESS_TOKEN_EXPIRES_TIME: string;
}

export class JwtService {
	constructor(
		private readonly jwt: JsonWebToken,
		private readonly config: JwtServiceConfig,
	) {}

	generateRefreshToken(payload: IRefreshTokenPayload) {
		return this.jwt.sign(payload, this.config.JWT_SECRET, {
			expiresIn: this.config.REFRESH_TOKEN_EXPIRES_TIME,
		});
	}

	generateAccessToken(payload: IAccessTokenPayload) {
		return this.jwt.sign(payload, this.config.JWT_SECRET, {
			expiresIn: this.config.ACCESS_TOKEN_EXPIRES_TIME,
		});
	}

	generateKeyPair(userId: string, tokenVersion: number) {
		const refreshToken = this.generateRefreshToken({ userId, tokenVersion });
		const accessToken = this.generateAccessToken({ userId });

		return { refreshToken, accessToken };
	}

	verifyToken<T>(token: string) {
		try {
			return this.jwt.verify(token, this.config.JWT_SECRET) as T;
		} catch (error) {
			return null;
		}
	}

	decodeToken<T>(token: string) {
		return this.jwt.decode(token) as T | null;
	}
}
