import jwt from 'jsonwebtoken';
import { JwtService } from '../jwt.service.js';
import { getRandomHash } from '../../../../utils/__stubs__/hash.stub.js';
import { faker } from '@faker-js/faker';
import { describe, vi, expect, it, beforeEach } from 'vitest';
import { RefreshTokenPayload, AccessTokenPayload } from '../jwt.types.js';

vi.mock('jsonwebtoken');

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
			const payload: RefreshTokenPayload = { tokenVersion: 0, userId: 'id' };

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
			const isActivated = faker.datatype.boolean();

			const generateAccessTokenSpy = vi
				.spyOn(jwtService, 'generateAccessToken')
				.mockReturnValue(accessToken);

			const generateRefreshTokenSpy = vi
				.spyOn(jwtService, 'generateRefreshToken')
				.mockReturnValue(refreshToken);

			const result = jwtService.generateKeyPair({
				isActivated,
				tokenVersion,
				userId,
			});

			expect(generateAccessTokenSpy).toBeCalledWith({ userId, isActivated });
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
		it('must call jwt.sign and return token', () => {
			jwt.sign = vi.fn().mockReturnValue(token);
			const payload: AccessTokenPayload = { userId: 'id', isActivated: true };

			const accessToken = jwtService.generateAccessToken(payload);

			expect(jwt.sign).toBeCalledWith(payload, JWT_SECRET, {
				expiresIn: ACCESS_TOKEN_EXPIRES_TIME,
			});
			expect(accessToken).toBe(token);
		});
	});

	describe('verifyToken', () => {
		it('must call jwt.verify and return payload', () => {
			const accessTokenPayload: AccessTokenPayload = {
				userId: 'id',
				isActivated: true,
			};
			jwt.verify = vi.fn().mockReturnValue(accessTokenPayload);

			const payload = jwtService.verifyToken(token);

			expect(jwt.verify).toBeCalledWith(token, JWT_SECRET);
			expect(payload).toEqual(accessTokenPayload);
		});

		it('must call jwt.verify and return null', () => {
			jwt.verify = vi.fn().mockImplementation(() => {
				throw new Error();
			});

			const payload = jwtService.verifyToken(token);

			expect(jwt.verify).toBeCalledWith(token, JWT_SECRET);
			expect(payload).toEqual(null);
		});
	});

	describe('decodeToken', () => {
		it('must call jwt.decode and return payload', () => {
			const accessTokenPayload: AccessTokenPayload = {
				userId: 'id',
				isActivated: true,
			};
			jwt.decode = vi.fn().mockReturnValue(accessTokenPayload);

			const payload = jwtService.decodeToken(token);

			expect(jwt.decode).toBeCalledWith(token);
			expect(payload).toEqual(accessTokenPayload);
		});
	});
});
