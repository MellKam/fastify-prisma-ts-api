import type jwt from 'jsonwebtoken';

type JsonWebToken = typeof jwt;

export interface RefreshTokenPayload {
	readonly userId: string;
	readonly tokenVersion: number;
}

export interface AccessTokenPayload {
	readonly userId: string;
	readonly isActivated: boolean;
}

interface TokenKeyPairData extends RefreshTokenPayload, AccessTokenPayload {}

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

	generateRefreshToken(payload: RefreshTokenPayload) {
		return this.jwt.sign(payload, this.config.JWT_SECRET, {
			expiresIn: this.config.REFRESH_TOKEN_EXPIRES_TIME,
		});
	}

	generateAccessToken(payload: AccessTokenPayload) {
		return this.jwt.sign(payload, this.config.JWT_SECRET, {
			expiresIn: this.config.ACCESS_TOKEN_EXPIRES_TIME,
		});
	}

	generateKeyPair(data: TokenKeyPairData) {
		const refreshToken = this.generateRefreshToken({
			userId: data.userId,
			tokenVersion: data.tokenVersion,
		});
		const accessToken = this.generateAccessToken({
			userId: data.userId,
			isActivated: data.isActivated,
		});

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
