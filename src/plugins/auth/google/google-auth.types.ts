export interface GoogleAuthUriOptions {
	redirect_uri: string;
	client_id: string;
	access_type: string;
	response_type: string;
	prompt: string;
	scope: string;
}

export interface GoogleTokenUriResponse {
	id_token: string;
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

export interface GoogleUserInfo {
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
