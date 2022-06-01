import { NODE_ENV_ENUM } from '../../utils/node-env';
import env from 'env-var';

export interface IConfig {
	NODE_ENV: NODE_ENV_ENUM;
	PORT: number;
	DATABASE_URL: string;
	SALT_ROUNDS: number;
	JWT_SECRET: string;
}

export const defaultConfig = {
	NODE_ENV: NODE_ENV_ENUM.development,
	PORT: 5000,
	SALT_ROUNDS: 6,
	JWT_SECRET: 'secret_key',
};

export default function initConfig(): IConfig | Error {
	const NODE_ENV =
		(env.get('NODE_ENV').asString() as NODE_ENV_ENUM) || defaultConfig.NODE_ENV;

	const PORT = env.get('PORT').asPortNumber() || defaultConfig.PORT;

	const DATABASE_URL = env.get('DATABASE_URL').asString();
	if (!DATABASE_URL)
		return new Error('Environment variable DATABASE_URL not provided');

	const SALT_ROUNDS =
		env.get('SALT_ROUNDS').asIntPositive() || defaultConfig.SALT_ROUNDS;

	const JWT_SECRET =
		env.get('JWT_SECRET').asString() || defaultConfig.JWT_SECRET;

	return {
		DATABASE_URL,
		JWT_SECRET,
		NODE_ENV,
		PORT,
		SALT_ROUNDS,
	};
}
