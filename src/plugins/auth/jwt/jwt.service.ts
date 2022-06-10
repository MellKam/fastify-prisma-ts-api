import jwt from 'jsonwebtoken';

export interface IRefreshTokenPayload {
	userId: string;
	tokenVersion: number;
}

export interface IAccessTokenPayload {
	userId: string;
}

interface JwtServiceOptions {
	JWT_SECRET: string;
	REFRESH_TOKEN_EXPIRES_TIME: string;
	ACCESS_TOKEN_EXPIRES_TIME: string;
}

export class JwtService {
	constructor(private readonly options: JwtServiceOptions) {}

	generateRefreshToken(payload: IRefreshTokenPayload) {
		return jwt.sign(payload, this.options.JWT_SECRET, {
			expiresIn: this.options.REFRESH_TOKEN_EXPIRES_TIME,
		});
	}

	generateAccessToken(payload: IAccessTokenPayload) {
		return jwt.sign(payload, this.options.JWT_SECRET, {
			expiresIn: this.options.ACCESS_TOKEN_EXPIRES_TIME,
		});
	}

	generateKeyPair(userId: string, tokenVersion: number) {
		const refreshToken = this.generateRefreshToken({ userId, tokenVersion });
		const accessToken = this.generateAccessToken({ userId });

		return { refreshToken, accessToken };
	}

	verifyToken<T>(token: string) {
		try {
			return jwt.verify(token, this.options.JWT_SECRET) as T;
		} catch (error) {
			return null;
		}
	}

	decodeToken<T>(token: string) {
		return jwt.decode(token) as T | null;
	}
}
