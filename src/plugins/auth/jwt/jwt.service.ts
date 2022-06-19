import type jwt from 'jsonwebtoken';
import {
	RefreshTokenPayload,
	AccessTokenPayload,
	TokenKeyPairData,
} from './jwt.types.js';

type JsonWebToken = typeof jwt;

export class JwtService {
	constructor(
		private readonly jwt: JsonWebToken,
		private readonly config: {
			readonly JWT_SECRET: string;
			readonly REFRESH_TOKEN_EXPIRES_TIME: string;
			readonly ACCESS_TOKEN_EXPIRES_TIME: string;
		},
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
