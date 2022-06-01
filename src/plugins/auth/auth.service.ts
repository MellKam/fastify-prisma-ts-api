import jwt from 'jsonwebtoken';

export interface IRefreshTokenPayload {
	userId: number;
	tokenVersion: number;
}

export interface IAccessTokenPayload {
	userId: number;
}

export class AuthService {
	constructor(private readonly secret: string) {}

	generateRefreshToken(payload: IRefreshTokenPayload) {
		return jwt.sign(payload, this.secret, { expiresIn: '7d' });
	}

	generateAccessToken(payload: IAccessTokenPayload) {
		return jwt.sign(payload, this.secret, { expiresIn: '15m' });
	}

	generateKeyPair(userId: number, tokenVersion: number) {
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
