export enum NODE_ENV_ENUM {
	development = 'development',
	production = 'production',
	test = 'test',
}

// derive env file name from process.env.NODE_ENV and process.env.LOCAL
// process.env.LOCAL must be a boolean type
export const getEnvFileName = () => {
	return `.env${
		process.env.NODE_ENV
			? '.' +
			  process.env.NODE_ENV +
			  (process.env.LOCAL === 'false' ? '' : '.local')
			: ''
	}`;
};

export const isProductionEnv =
	process.env.NODE_ENV === NODE_ENV_ENUM.production;
