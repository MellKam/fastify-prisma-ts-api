export interface RefreshTokenPayload {
	readonly userId: string;
	readonly tokenVersion: number;
}

export interface AccessTokenPayload {
	readonly userId: string;
	readonly isActivated: boolean;
}

export interface TokenKeyPairData
	extends RefreshTokenPayload,
		AccessTokenPayload {}
