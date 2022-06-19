export interface GoogleAuthUriOptions {
	redirect_uri: string;
	client_id: string;
	access_type: string;
	response_type: string;
	prompt: string;
	scope: string;
}

type TokenType = 'Bearer';

export interface GoogleTokenGrantAuthCodeResponse {
	id_token: string;
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: TokenType;
}

export interface GoogleUserInfo {
	// googleSub is a unique Google Account Id
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

export type GrantType = 'authorization_code' | 'refresh_token';

export interface GoogleTokenUriRequestOptions {
	code?: string;
	refresh_token?: string;
	client_id: string;
	client_secret: string;
	redirect_uri?: string;
	grant_type: GrantType;
}

export enum GoogleAuthScope {
	USER_INFO_PROFILE = 'https://www.googleapis.com/auth/userinfo.profile',
	USER_INFO_EMAIL = 'https://www.googleapis.com/auth/userinfo.email',
	// MAIL = 'https://mail.google.com/',
}
