import { NODE_ENV_ARRAY, NODE_ENV_ENUM } from '../../utils/environment.js';
import env from 'env-var';

export interface IConfig {
	NODE_ENV: NODE_ENV_ENUM;
	PORT: number;
	DATABASE_URL: string;
	SALT_ROUNDS: number;
	JWT_SECRET: string;
}

const defaultConfig: IConfig = {
	NODE_ENV: NODE_ENV_ENUM.development,
	PORT: 5000,
	SALT_ROUNDS: 6,
	JWT_SECRET: 'secret_key',
	DATABASE_URL: '',
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

	return {
		DATABASE_URL,
		JWT_SECRET,
		NODE_ENV,
		PORT,
		SALT_ROUNDS,
	};
}
