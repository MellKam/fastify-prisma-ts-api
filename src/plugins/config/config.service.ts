import { NODE_ENV_ARRAY, NODE_ENV_ENUM } from '../../utils/environment.js';
import env from 'env-var';

export interface IConfig {
	NODE_ENV: NODE_ENV_ENUM;
	PORT: number;
	DATABASE_URL: string;
	SALT_ROUNDS: number;
	JWT_SECRET: string;
	WEB_APP_URL: string;
	ACCESS_TOKEN_EXPIRES_TIME: string;
	REFRESH_TOKEN_EXPIRES_TIME: string;
}

const defaultConfig: IConfig = {
	NODE_ENV: NODE_ENV_ENUM.development,
	PORT: 5000,
	SALT_ROUNDS: 6,
	JWT_SECRET: 'secret_key',
	DATABASE_URL: '',
	WEB_APP_URL: '',
	ACCESS_TOKEN_EXPIRES_TIME: '15m',
	REFRESH_TOKEN_EXPIRES_TIME: '7d',
};

export default function initConfig(): IConfig {
	const NODE_ENV = env
		.get('NODE_ENV')
		.default(defaultConfig.NODE_ENV)
		.asEnum(NODE_ENV_ARRAY);

	const PORT = env.get('PORT').default(defaultConfig.PORT).asPortNumber();

	const DATABASE_URL = env.get('DATABASE_URL').required().asString();

	const SALT_ROUNDS = env
		.get('SALT_ROUNDS')
		.default(defaultConfig.SALT_ROUNDS)
		.asIntPositive();

	const JWT_SECRET = env
		.get('JWT_SECRET')
		.default(defaultConfig.JWT_SECRET)
		.asString();

	const WEB_APP_URL = env.get('WEB_APP_URL').required().asUrlString();

	const ACCESS_TOKEN_EXPIRES_TIME = env
		.get('ACCESS_TOKEN_EXPIRES_TIME')
		.default(defaultConfig.ACCESS_TOKEN_EXPIRES_TIME)
		.asString();

	const REFRESH_TOKEN_EXPIRES_TIME = env
		.get('RESRESH_TOKEN_EXPIRES_TIME')
		.default(defaultConfig.REFRESH_TOKEN_EXPIRES_TIME)
		.asString();

	return {
		DATABASE_URL,
		JWT_SECRET,
		NODE_ENV,
		PORT,
		SALT_ROUNDS,
		WEB_APP_URL,
		ACCESS_TOKEN_EXPIRES_TIME,
		REFRESH_TOKEN_EXPIRES_TIME,
	};
}
