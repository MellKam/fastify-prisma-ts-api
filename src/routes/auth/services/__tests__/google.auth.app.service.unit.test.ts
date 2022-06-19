import { GoogleAuthService } from '../../../../plugins/auth/google/google-auth.service.js';
import { faker } from '@faker-js/faker';
import {
	GoogleTokenGrantAuthCodeResponse,
	GoogleUserInfo,
} from '../../../../plugins/auth/google/google-auth.types.js';
import {
	describe,
	expect,
	MockedObject,
	vi,
	it,
	beforeEach,
	MockedFunction,
} from 'vitest';
import { JwtService } from '../../../../plugins/auth/jwt/jwt.service';
import { getRandomHash } from '../../../../utils/__stubs__/hash.stub.js';
import { GoogleAuthAppService } from '../google.auth.app.service.js';
import prismaClient from '../../../../plugins/database/prisma/prisma-client.js';
import {
	BadRequestError,
	HttpError,
	InternalServerError,
} from '../../../../utils/http-errors.js';
import { User } from '@prisma/client';
import { TokenKeyPairData } from '../../../../plugins/auth/jwt/jwt.types.js';

vi.mock('../../../../plugins/auth/jwt/jwt.service');
vi.mock('../../../../plugins/auth/google/google-auth.service.js');
vi.mock('../../../../plugins/database/prisma/prisma-client.js');

describe('googleAuthAppService', () => {
	const jwtService = new JwtService({} as any, {} as any);
	const jwtServiceMock = jwtService as MockedObject<JwtService>;
	const googleAuthService = new GoogleAuthService({} as any, {} as any);
	const googleAuthServiceMock =
		googleAuthService as MockedObject<GoogleAuthService>;

	const googleAuthAppService = new GoogleAuthAppService({
		googleAuthService,
		jwtService,
		userRepository: prismaClient.user,
	});

	let code: string;
	let googleUser: GoogleUserInfo;

	beforeEach(() => {
		code = getRandomHash();

		googleUser = {
			email: faker.internet.email(),
			email_verified: true,
			locale: faker.random.locale(),
			name: faker.internet.userName(),
			exp: +faker.random.numeric(),
			sub: getRandomHash(),
		};

		vi.clearAllMocks();
	});

	describe('getGoogleUserByCode', () => {
		let googleResponse: GoogleTokenGrantAuthCodeResponse;

		beforeEach(() => {
			googleResponse = {
				access_token: getRandomHash(),
				expires_in: +faker.random.numeric(),
				id_token: getRandomHash(),
				refresh_token: getRandomHash(),
				token_type: 'Bearer',
			};
		});

		it('must return googleUser', async () => {
			googleAuthServiceMock.verifyUserCode.mockResolvedValueOnce(
				googleResponse,
			);
			jwtServiceMock.decodeToken.mockReturnValueOnce(googleUser);

			await expect(
				(googleAuthAppService as any).getGoogleUserByCode(code),
			).resolves.toEqual(googleUser);
			expect(googleAuthService.verifyUserCode).toBeCalledWith(code);
			expect(jwtService.decodeToken).toBeCalledWith(googleResponse.id_token);
		});

		it('must throw internal server error "Cannot decode user token"', async () => {
			googleAuthServiceMock.verifyUserCode.mockResolvedValueOnce(
				googleResponse,
			);
			jwtServiceMock.decodeToken.mockReturnValueOnce(null);

			try {
				await (googleAuthAppService as any).getGoogleUserByCode(code);
			} catch (error: any) {
				expect(error).toBeInstanceOf(InternalServerError);
				expect(error.message).toBe('Cannot decode user token');
			}

			expect(googleAuthService.verifyUserCode).toBeCalledWith(code);
			expect(jwtService.decodeToken).toBeCalledWith(googleResponse.id_token);
		});

		it('must throw http error', async () => {
			googleAuthServiceMock.verifyUserCode.mockImplementationOnce(() => {
				throw new HttpError('Cannot get user token from Google', 400);
			});

			try {
				await (googleAuthAppService as any).getGoogleUserByCode(code);
			} catch (error: any) {
				expect(error).toBeInstanceOf(HttpError);
			}

			expect(googleAuthService.verifyUserCode).toBeCalledWith(code);
			expect(jwtService.decodeToken).not.toBeCalled();
		});
	});

	describe('loginWithGoogle', () => {
		let tokenKeyPair: {
			refreshToken: string;
			accessToken: string;
		};
		let user: User;
		let createdAt: Date;

		beforeEach(() => {
			tokenKeyPair = {
				refreshToken: getRandomHash(),
				accessToken: getRandomHash(),
			};
			createdAt = faker.datatype.datetime();
			user = {
				email: googleUser.email,
				googleSub: googleUser.sub,
				locale: googleUser.locale,
				name: googleUser.name,
				isActivated: true,
				tokenVersion: 0,
				id: faker.datatype.uuid(),
				updatedAt: createdAt,
				createdAt,
				localAuthId: null,
			};
		});

		it('must register and generate token keypair for new google user', async () => {
			vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValueOnce(null);
			vi.spyOn(prismaClient.user, 'create').mockResolvedValueOnce(user);
			const getGoogleUserByCodeSpy = vi
				.spyOn(GoogleAuthAppService.prototype as any, 'getGoogleUserByCode')
				.mockResolvedValueOnce(googleUser);
			jwtServiceMock.generateKeyPair.mockReturnValueOnce(tokenKeyPair);

			await expect(googleAuthAppService.loginWithGoogle(code)).resolves.toEqual(
				tokenKeyPair,
			);
			expect(prismaClient.user.findUnique).toBeCalledWith({
				where: { email: googleUser.email },
			});

			const createUserArgs = (prismaClient.user.create as MockedFunction<any>)
				.mock.calls[0][0] as {
				data: {
					isActivated: boolean;
					tokenVersion: number;
					email: string;
					googleSub: string;
					locale: string;
					name: string;
				};
			};

			expect(createUserArgs.data.tokenVersion).toBe(1);
			expect(createUserArgs.data.googleSub).toBe(googleUser.sub);
			expect(createUserArgs.data.isActivated).toBe(true);

			expect(jwtService.generateKeyPair).toBeCalledWith({
				isActivated: user.isActivated,
				tokenVersion: user.tokenVersion,
				userId: user.id,
			} as TokenKeyPairData);
			expect(getGoogleUserByCodeSpy).toBeCalledWith(code);
		});

		it('must throw error when user email is not verified', async () => {
			googleUser.email_verified = false;

			const getGoogleUserByCodeSpy = vi
				.spyOn(GoogleAuthAppService.prototype as any, 'getGoogleUserByCode')
				.mockResolvedValueOnce(googleUser);

			try {
				await googleAuthAppService.loginWithGoogle(code);
			} catch (error: any) {
				expect(error).toBeInstanceOf(BadRequestError);
				expect(error.message).toBe('User email not verified');
			}
			expect(getGoogleUserByCodeSpy).toBeCalledWith(code);
		});

		it('must add to existing user google auth data and return token keypair', async () => {
			user.googleSub = null;
			const savedTokenVersion = user.tokenVersion;

			vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValueOnce(user);
			vi.spyOn(prismaClient.user, 'update').mockImplementation(async () => {
				user.tokenVersion++;
				user.googleSub = googleUser.sub;
				return user as any;
			});

			const getGoogleUserByCodeSpy = vi
				.spyOn(GoogleAuthAppService.prototype as any, 'getGoogleUserByCode')
				.mockResolvedValueOnce(googleUser);
			jwtServiceMock.generateKeyPair.mockReturnValueOnce(tokenKeyPair);

			await expect(googleAuthAppService.loginWithGoogle(code)).resolves.toEqual(
				tokenKeyPair,
			);
			expect(prismaClient.user.findUnique).toBeCalledTimes(1);
			expect(prismaClient.user.update).toBeCalledTimes(1);
			expect(jwtService.generateKeyPair).toBeCalledWith({
				isActivated: user.isActivated,
				tokenVersion: user.tokenVersion,
				userId: user.id,
			} as TokenKeyPairData);
			expect(getGoogleUserByCodeSpy).toBeCalledWith(code);
			expect(user.googleSub).toBe(googleUser.sub);
			expect(savedTokenVersion).toBe(user.tokenVersion - 1);
		});

		it('must add to existing user google auth data and return token keypair', async () => {
			user.googleSub = null;
			user.name = null;
			user.locale = null;

			vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValueOnce(user);
			vi.spyOn(prismaClient.user, 'update').mockImplementation(async () => {
				user.tokenVersion++;
				user.googleSub = googleUser.sub;

				return user as any;
			});
			vi.spyOn(
				GoogleAuthAppService.prototype as any,
				'getGoogleUserByCode',
			).mockResolvedValueOnce(googleUser);
			jwtServiceMock.generateKeyPair.mockReturnValueOnce(tokenKeyPair);

			await expect(googleAuthAppService.loginWithGoogle(code)).resolves.toEqual(
				tokenKeyPair,
			);

			const updateUserArgs = (prismaClient.user.update as MockedFunction<any>)
				.mock.calls[0][0] as {
				data: {
					isActivated: boolean;
					tokenVersion: number;
					googleSub: string;
					locale?: string;
					name?: string;
				};
			};

			expect(updateUserArgs.data.locale).toBe(googleUser.locale);
			expect(updateUserArgs.data.name).toBe(googleUser.name);
			expect(user.googleSub).toBe(googleUser.sub);
		});

		it('must login existing user and return token keypair', async () => {
			vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValueOnce(user);
			const savedTokenVersion = user.tokenVersion;
			vi.spyOn(prismaClient.user, 'update').mockImplementation(async () => {
				user.tokenVersion++;
				return user as any;
			});

			const getGoogleUserByCodeSpy = vi
				.spyOn(GoogleAuthAppService.prototype as any, 'getGoogleUserByCode')
				.mockResolvedValueOnce(googleUser);
			jwtServiceMock.generateKeyPair.mockReturnValueOnce(tokenKeyPair);

			await expect(googleAuthAppService.loginWithGoogle(code)).resolves.toEqual(
				tokenKeyPair,
			);
			expect(prismaClient.user.findUnique).toBeCalledTimes(1);
			expect(prismaClient.user.update).toBeCalledTimes(1);
			expect(jwtService.generateKeyPair).toBeCalledWith({
				isActivated: user.isActivated,
				tokenVersion: user.tokenVersion,
				userId: user.id,
			} as TokenKeyPairData);
			expect(getGoogleUserByCodeSpy).toBeCalledWith(code);
			expect(savedTokenVersion).toBe(user.tokenVersion - 1);
		});

		it('must throw internal server error on unexpected error', async () => {
			vi.spyOn(
				GoogleAuthAppService.prototype as any,
				'getGoogleUserByCode',
			).mockImplementation(async () => {
				throw new Error('TEST');
			});

			try {
				await googleAuthAppService.loginWithGoogle(code);
			} catch (error: any) {
				expect(error).toBeInstanceOf(InternalServerError);
				expect(error.message).toBe('TEST');
			}
		});
	});

	describe('getGoogleAuthUrl', () => {
		it('must call googleAuthService and return url', () => {
			const url = faker.internet.url();
			googleAuthServiceMock.getGoogleAuthUrl.mockReturnValue(url);

			expect(googleAuthAppService.getGoogleAuthUrl()).toBe(url);
		});
	});
});
