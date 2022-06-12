import { NODE_ENV_ENUM } from '../../utils/environment.js';
import { Static, Type } from '@sinclair/typebox';

export const configSchema = Type.Strict(
	Type.Object({
		NODE_ENV: Type.Enum(NODE_ENV_ENUM, { default: NODE_ENV_ENUM.development }),
		PORT: Type.Integer({ default: 5000 }),
		DATABASE_URL: Type.String({ format: 'uri' }),
		SALT_ROUNDS: Type.Integer({ default: 6 }),
		JWT_SECRET: Type.String({ default: 'secret_key' }),
		WEB_APP_URL: Type.String({ format: 'uri' }),
		ACCESS_TOKEN_EXPIRES_TIME: Type.String({ default: '15m' }),
		REFRESH_TOKEN_EXPIRES_TIME: Type.String({ default: '7d' }),
		GOOGLE_OAUTH_CLIENT_ID: Type.String(),
		GOOGLE_OAUTH_CLIENT_SECRET: Type.String(),
		GOOGLE_OAUTH_REDIRECT_URI: Type.String({ format: 'uri' }),
	}),
);

export type AppConfig = Static<typeof configSchema>;
