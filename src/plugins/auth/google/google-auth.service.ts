import { AxiosInstance } from 'axios';
import { HttpError, InternalServerError } from '../../../utils/http-errors.js';
import {
	GoogleAuthUriOptions,
	GoogleTokenUriRequestOptions,
	GoogleTokenUriResponse,
} from './google-auth.types.js';

interface GoogleAuthServiceConfig {
	readonly GOOGLE_OAUTH_CLIENT_ID: string;
	readonly GOOGLE_OAUTH_CLIENT_SECRET: string;
	readonly GOOGLE_OAUTH_REDIRECT_URI: string;
}

export class GoogleAuthService {
	private readonly AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';
	private readonly TOKEN_URI = 'https://oauth2.googleapis.com/token';
	private readonly SCOPE_PROFILE =
		'https://www.googleapis.com/auth/userinfo.profile';
	private readonly SCOPE_EMAIL =
		'https://www.googleapis.com/auth/userinfo.email';

	private readonly AUTH_URI_OPTIONS: Record<keyof GoogleAuthUriOptions, string>;

	constructor(
		private readonly axios: AxiosInstance,
		private readonly config: GoogleAuthServiceConfig,
	) {
		this.AUTH_URI_OPTIONS = {
			client_id: this.config.GOOGLE_OAUTH_CLIENT_ID,
			redirect_uri: this.config.GOOGLE_OAUTH_REDIRECT_URI,
			access_type: 'offline',
			response_type: 'code',
			prompt: 'consent',
			scope: [this.SCOPE_EMAIL, this.SCOPE_PROFILE].join(' '),
		};
	}

	getGoogleAuthUrl() {
		const options = new URLSearchParams(this.AUTH_URI_OPTIONS);

		return `${this.AUTH_URI}?${options.toString()}`;
	}

	async verifyUserCode(code: string) {
		const options: GoogleTokenUriRequestOptions = {
			code,
			client_id: this.config.GOOGLE_OAUTH_CLIENT_ID,
			client_secret: this.config.GOOGLE_OAUTH_CLIENT_SECRET,
			redirect_uri: this.config.GOOGLE_OAUTH_REDIRECT_URI,
			grant_type: 'authorization_code',
		};

		try {
			const response = await this.axios.post<GoogleTokenUriResponse>(
				this.TOKEN_URI,
				new URLSearchParams(
					options as Record<keyof GoogleTokenUriRequestOptions, string>,
				).toString(),
				{
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				},
			);
			return response.data;
		} catch (error: any) {
			if (error.response) {
				throw new HttpError(
					`Cannot get response from ${this.TOKEN_URI}, error: ${JSON.stringify(
						error.response.data,
					)}`,
					error.response.status,
				);
			}
			throw new InternalServerError(error.message);
		}
	}
}
