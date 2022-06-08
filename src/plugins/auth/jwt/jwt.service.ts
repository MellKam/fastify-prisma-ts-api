import jwt from 'jsonwebtoken';

export interface IRefreshTokenPayload {
	userId: string;
	tokenVersion: number;
}

export interface IAccessTokenPayload {
	userId: string;
}

export class JwtService {
	constructor(
		readonly secret: string,
		readonly accessTokenExpiresTime: string,
		readonly refreshTokenExpiresTime: string,
	) {}

	generateRefreshToken(payload: IRefreshTokenPayload) {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.refreshTokenExpiresTime,
		});
	}

	generateAccessToken(payload: IAccessTokenPayload) {
		return jwt.sign(payload, this.secret, {
			expiresIn: this.accessTokenExpiresTime,
		});
	}

	generateKeyPair(userId: string, tokenVersion: number) {
		const refreshToken = this.generateRefreshToken({ userId, tokenVersion });
		const accessToken = this.generateAccessToken({ userId });

		return { refreshToken, accessToken };
	}

	getTokenPayload(token: string) {
		try {
			return jwt.verify(token, this.secret);
		} catch (error) {
			return null;
		}
	}
}
