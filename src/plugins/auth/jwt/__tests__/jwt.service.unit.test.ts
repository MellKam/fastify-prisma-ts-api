import jwt from 'jsonwebtoken';
import {
	IAccessTokenPayload,
	IRefreshTokenPayload,
	JwtService,
} from '../jwt.service.js';
import { getRandomHash } from '../../../../utils/__stubs__/hash.stub.js';
import { faker } from '@faker-js/faker';
import { describe, vi, expect, it, beforeEach } from 'vitest';

describe('JwtService', () => {
	const ACCESS_TOKEN_EXPIRES_TIME = '15m';
	const REFRESH_TOKEN_EXPIRES_TIME = '7d';
	const JWT_SECRET = 'secret';
	const jwtService = new JwtService(jwt, {
		ACCESS_TOKEN_EXPIRES_TIME,
		REFRESH_TOKEN_EXPIRES_TIME,
		JWT_SECRET,
	});

	let token: string;

	beforeEach(() => {
		token = getRandomHash();
	});

	describe('generateRefreshToken', () => {
		it('must call jwt.sign and return token', () => {
			jwt.sign = vi.fn().mockReturnValue(token);
			const payload: IRefreshTokenPayload = { tokenVersion: 0, userId: 'id' };

			const refreshToken = jwtService.generateRefreshToken(payload);

			expect(jwt.sign).toBeCalledWith(payload, JWT_SECRET, {
				expiresIn: REFRESH_TOKEN_EXPIRES_TIME,
			});

			expect(refreshToken).toBe(token);
		});
	});

	describe('generateKeyPair', () => {
		it('must call generateAccessToken and generateRefreshToken', () => {
			const userId = faker.datatype.uuid();
			const tokenVersion = faker.datatype.number();
			const accessToken = getRandomHash();
			const refreshToken = getRandomHash();

			const generateAccessTokenSpy = vi
				.spyOn(jwtService, 'generateAccessToken')
				.mockReturnValue(accessToken);

			const generateRefreshTokenSpy = vi
				.spyOn(jwtService, 'generateRefreshToken')
				.mockReturnValue(refreshToken);

			const result = jwtService.generateKeyPair(userId, tokenVersion);

			expect(generateAccessTokenSpy).toBeCalledWith({ userId });
			expect(generateRefreshTokenSpy).toBeCalledWith({
				userId,
				tokenVersion,
			});

			expect(result.accessToken).toBe(accessToken);
			expect(result.refreshToken).toBe(refreshToken);

			generateAccessTokenSpy.mockRestore();
			generateRefreshTokenSpy.mockRestore();
		});
	});

	describe('generateAccessToken', () => {
		it('must call ', () => {
			jwt.sign = vi.fn().mockReturnValue(token);
			const payload: IAccessTokenPayload = { userId: 'id' };

			const accessToken = jwtService.generateAccessToken(payload);

			expect(jwt.sign).toBeCalledWith(payload, JWT_SECRET, {
				expiresIn: ACCESS_TOKEN_EXPIRES_TIME,
			});

			expect(accessToken).toBe(token);
		});
	});
});
