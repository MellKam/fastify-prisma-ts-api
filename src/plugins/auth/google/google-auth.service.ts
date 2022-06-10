import { AxiosInstance } from 'axios';
import { HttpError } from '../../../utils/http-errors.js';

interface IAuthUriOptions {
	redirect_uri: string;
	client_id: string;
	access_type: string;
	response_type: string;
	prompt: string;
	scope: string;
}

interface IGoogleTokenUriResponse {
	id_token: string;
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

export interface IGoogleUserInfo {
	sub: string;
	email: string;
	email_verified: boolean;
	name: string;
	picture?: string;
	given_name?: string;
	family_name?: string;
	locale: string;
	exp: number;
}

export class GoogleAuthService {
	private readonly AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';
	private readonly TOKEN_URI = 'https://oauth2.googleapis.com/token';
	private readonly SCOPE_PROFILE =
		'https://www.googleapis.com/auth/userinfo.profile';
	private readonly SCOPE_EMAIL =
		'https://www.googleapis.com/auth/userinfo.email';

	private readonly AUTH_URI_OPTIONS: Record<keyof IAuthUriOptions, string>;

	constructor(
		private readonly GOOGLE_OAUTH_CLIENT_ID: string,
		private readonly GOOGLE_OAUTH_CLIENT_SECRET: string,
		private readonly GOOGLE_OAUTH_REDIRECT_URI: string,
		private readonly axios: AxiosInstance,
	) {
		this.AUTH_URI_OPTIONS = {
			client_id: this.GOOGLE_OAUTH_CLIENT_ID,
			redirect_uri: this.GOOGLE_OAUTH_REDIRECT_URI,
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
		const options = new URLSearchParams({
			code,
			client_id: this.GOOGLE_OAUTH_CLIENT_ID,
			client_secret: this.GOOGLE_OAUTH_CLIENT_SECRET,
			redirect_uri: this.GOOGLE_OAUTH_REDIRECT_URI,
			grant_type: 'authorization_code',
		});

		try {
			const response = await this.axios.post<IGoogleTokenUriResponse>(
				this.TOKEN_URI,
				options.toString(),
				{
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				},
			);
			return response.data;
		} catch (error: any) {
			throw new HttpError(
				`Cannot get response from ${this.TOKEN_URI}, error: ${JSON.stringify(
					error.response?.data,
				)}`,
				error.response?.status || 500,
			);
		}
	}
}
