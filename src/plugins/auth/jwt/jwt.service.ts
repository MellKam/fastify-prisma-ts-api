import jwt from 'jsonwebtoken';
import { IConfig } from '../../config/config.service.js';

export interface IRefreshTokenPayload {
	userId: string;
	tokenVersion: number;
}

export interface IAccessTokenPayload {
	userId: string;
}

export class JwtService {
	constructor(readonly config: IConfig) {}

	generateRefreshToken(payload: IRefreshTokenPayload) {
		return jwt.sign(payload, this.config.JWT_SECRET, {
			expiresIn: this.config.REFRESH_TOKEN_EXPIRES_TIME,
		});
	}

	generateAccessToken(payload: IAccessTokenPayload) {
		return jwt.sign(payload, this.config.JWT_SECRET, {
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
			return jwt.verify(token, this.config.JWT_SECRET) as T;
		} catch (error) {
			return null;
		}
	}

	decodeToken<T>(token: string) {
		return jwt.decode(token) as T | null;
	}
}
