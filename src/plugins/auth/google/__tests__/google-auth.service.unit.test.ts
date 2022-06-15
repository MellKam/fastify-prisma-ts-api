import { faker } from '@faker-js/faker';
import axios from 'axios';
import { describe, vi, expect, it } from 'vitest';
import {
	HttpError,
	InternalServerError,
} from '../../../../utils/http-errors.js';
import { getRandomHash } from '../../../../utils/__stubs__/hash.stub.js';
import { LikeAxiosError } from '../../../../utils/__stubs__/like-axios-error.js';
import { GoogleAuthService } from '../google-auth.service.js';
import {
	GoogleAuthScope,
	GoogleAuthUriOptions,
	GoogleTokenUriRequestOptions,
	GoogleUserInfo,
} from '../google-auth.types.js';

vi.mock('axios');

describe('GoogleAuthService', () => {
	const GOOGLE_OAUTH_CLIENT_ID = 'googleOauthClientId';
	const GOOGLE_OAUTH_CLIENT_SECRET = 'googleOauthClientSecret';
	const GOOGLE_OAUTH_REDIRECT_URI = 'googleOauthRedirectUri';
	const config = {
		GOOGLE_OAUTH_CLIENT_ID,
		GOOGLE_OAUTH_CLIENT_SECRET,
		GOOGLE_OAUTH_REDIRECT_URI,
	};

	describe('constructor', () => {
		it('must assign options to AUTH_URI_OPTIONS', () => {
			const jwtService = new (GoogleAuthService as any)(axios, config);

			expect(jwtService.AUTH_URI_OPTIONS).toEqual({
				client_id: GOOGLE_OAUTH_CLIENT_ID,
				redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
				access_type: 'offline',
				response_type: 'code',
				prompt: 'consent',
				scope: [
					GoogleAuthScope.USER_INFO_EMAIL,
					GoogleAuthScope.USER_INFO_PROFILE,
				].join(' '),
			} as GoogleAuthUriOptions);
		});
	});

	describe('methods', () => {
		describe('getGoogleAuthUrl', () => {
			it('must return correct uri', () => {
				const jwtService = new (GoogleAuthService as any)(axios, config);

				const uri = jwtService.getGoogleAuthUrl();

				const expectedUri = `${jwtService.AUTH_URI}?${new URLSearchParams(
					jwtService.AUTH_URI_OPTIONS,
				).toString()}`;

				expect(uri).toBe(expectedUri);
			});
		});

		describe('verifyUserCode', () => {
			const jwtService = new GoogleAuthService(axios, config);
			const code = getRandomHash();
			const googleUserInfo: GoogleUserInfo = {
				email: faker.internet.email(),
				email_verified: faker.datatype.boolean(),
				exp: +faker.random.numeric(6),
				name: faker.name.firstName(),
				locale: faker.random.locale(),
				sub: faker.random.numeric(12),
			};

			it('must create options, call axios.post and return response.data', async () => {
				const options: GoogleTokenUriRequestOptions = {
					code,
					client_id: GOOGLE_OAUTH_CLIENT_ID,
					client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
					redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
					grant_type: 'authorization_code',
				};
				axios.post = vi.fn().mockResolvedValueOnce({ data: googleUserInfo });

				await expect(jwtService.verifyUserCode(code)).resolves.toEqual(
					googleUserInfo,
				);

				expect(axios.post).toBeCalledWith(
					(jwtService as any).TOKEN_URI,
					new URLSearchParams(
						options as Record<keyof GoogleTokenUriRequestOptions, string>,
					).toString(),
					{
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					},
				);
			});

			it('must throw internal server error', async () => {
				axios.post = vi.fn().mockImplementationOnce(async () => {
					throw new Error();
				});

				await expect(async () =>
					jwtService.verifyUserCode(code),
				).rejects.toBeInstanceOf(InternalServerError);
			});

			it('must throw http error', async () => {
				const responseData = { error: 'TEST' };
				const errorStatus = 400;

				axios.post = vi.fn().mockImplementationOnce(async () => {
					throw new LikeAxiosError('TEST', {
						data: responseData,
						status: errorStatus,
						config: {},
						headers: {},
						statusText: errorStatus.toString(),
						request: {},
					});
				});

				try {
					await jwtService.verifyUserCode(code);
				} catch (error: any) {
					expect(error).toBeInstanceOf(HttpError);
					expect(error.message).toBe(
						`Cannot get response from ${
							(jwtService as any).TOKEN_URI
						}, error: ${JSON.stringify(responseData)}`,
					);
					expect(error.statusCode).toBe(errorStatus);
				}
			});
		});
	});
});
