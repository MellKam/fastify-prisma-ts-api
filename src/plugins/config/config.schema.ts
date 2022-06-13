import { NODE_ENV_ENUM } from '../../utils/environment.js';
import { Static, Type } from '@sinclair/typebox';

export const configSchema = Type.Strict(
	Type.Object({
		// Server
		NODE_ENV: Type.Enum(NODE_ENV_ENUM, { default: NODE_ENV_ENUM.development }),
		HOST: Type.String({ default: '127.0.0.1' }),
		PORT: Type.Integer({ default: 5000 }),
		SSL: Type.Boolean({ default: false }),

		// Databases
		DATABASE_URL: Type.String({ format: 'uri' }),
		REDIS_URL: Type.String({ format: 'uri' }),

		// Crypto config
		SALT_ROUNDS: Type.Integer({ default: 6 }),
		JWT_SECRET: Type.String({ default: 'secret_key' }),
		ACCESS_TOKEN_EXPIRES_TIME: Type.String({ default: '15m' }),
		REFRESH_TOKEN_EXPIRES_TIME: Type.String({ default: '30d' }),

		// Google related
		GOOGLE_OAUTH_CLIENT_ID: Type.String(),
		GOOGLE_OAUTH_CLIENT_SECRET: Type.String(),
		GOOGLE_OAUTH_REDIRECT_URI: Type.String({ format: 'uri' }),

		// Mail config
		GMAIL_ADDRESS: Type.String({ format: 'email' }),
		GMAIL_REFRESH_TOKEN: Type.String(),

		WEB_APP_URL: Type.String({ format: 'uri' }),
	}),
);

export type AppConfig = Static<typeof configSchema>;
