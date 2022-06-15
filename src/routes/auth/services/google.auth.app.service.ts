import { PrismaClient, User } from '@prisma/client';
import { GoogleAuthService } from '../../../plugins/auth/google/google-auth.service.js';
import { GoogleUserInfo } from '../../../plugins/auth/google/google-auth.types.js';
import { JwtService } from '../../../plugins/auth/jwt/jwt.service.js';
import {
	BadRequestError,
	InternalServerError,
} from '../../../utils/http-errors.js';

export class GoogleAuthAppService {
	constructor(
		private readonly deps: {
			readonly userRepository: PrismaClient['user'];
			readonly googleAuthService: GoogleAuthService;
			readonly jwtService: JwtService;
		},
	) {}

	// alias for GoogleAuthService method
	// made so that controller only depends on the service
	getGoogleAuthUrl() {
		return this.deps.googleAuthService.getGoogleAuthUrl();
	}

	private async getGoogleUserByCode(code: string) {
		const googleResponse = await this.deps.googleAuthService.verifyUserCode(
			code,
		);
		// we trust Google so we can just decode this token
		const googleUser = this.deps.jwtService.decodeToken<GoogleUserInfo>(
			googleResponse.id_token,
		);

		if (googleUser === null) {
			throw new InternalServerError('Cannot decode user token');
		}
		return googleUser;
	}

	/**
	 * Fetch google user by code and login it if account already exists
	 * if the account doesn't exit, register new user and login to it
	 *
	 * @param code
	 * Google Authorization code
	 *
	 * @returns refresh and access token
	 */
	async loginWithGoogle(code: string) {
		try {
			const googleUser = await this.getGoogleUserByCode(code);

			if (!googleUser.email_verified) {
				throw new BadRequestError('User email not verified');
			}

			const existingUser = await this.deps.userRepository.findUnique({
				where: { email: googleUser.email },
			});

			let user: User;

			if (existingUser !== null && existingUser.googleSub === null) {
				// if user is already registered but does not have a Google auth method
				// -> Add to user Google auth data

				user = await this.deps.userRepository.update({
					where: { id: existingUser.id },
					data: {
						googleSub: googleUser.sub,
						// if user don't have setted this data, then set it from google
						locale: existingUser.locale ? undefined : googleUser.locale,
						name: existingUser.name ? undefined : googleUser.name,
						// in case the user has not activated an account with local auth
						isActiveted: true,
						// increment token to login user and revoke latest tokens
						tokenVersion: { increment: 1 },
					},
				});
			} else if (existingUser !== null) {
				// if user is already registered and has Google auth method
				// -> login user

				user = await this.deps.userRepository.update({
					where: { id: existingUser.id },
					data: { tokenVersion: { increment: 1 } },
				});
			} else {
				// if user is not registered -> then register it

				user = await this.deps.userRepository.create({
					data: {
						email: googleUser.email,
						googleSub: googleUser.sub,
						locale: googleUser.locale,
						name: googleUser.name,
						// when a user register with Google, we can automatically set their account as activated
						isActiveted: true,
						// increment token to login user and revoke latest tokens
						tokenVersion: 1,
					},
				});
			}

			return this.deps.jwtService.generateKeyPair({
				isActivated: user.isActiveted,
				tokenVersion: user.tokenVersion,
				userId: user.id,
			});
		} catch (error: any) {
			if (error.statusCode && error.statusCode !== 500) {
				throw error;
			}
			throw new InternalServerError(error.message);
		}
	}
}
