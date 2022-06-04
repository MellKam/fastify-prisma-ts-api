import fastify from 'fastify';
import cookiePlugin from '@fastify/cookie';
import dotenv from 'dotenv';
import * as plugins from './plugins/index.js';
import productPlugin from './routes/product/product.plugin.js';
import { productSchemas } from './routes/product/product.schema.js';
import userPlugin from './routes/user/user.plugin.js';
import { userSchemas } from './routes/user/user.schema.js';
import { defaulFieldsSchema } from './utils/defautl-model-fileds.js';
import { getEnvFileName, isProductionEnv } from './utils/environment.js';

dotenv.config({ path: getEnvFileName() });

export default function buildApp() {
	const app = fastify({
		logger: {
			prettyPrint: isProductionEnv
				? false
				: {
						colorize: true,
						ignore: 'pid,hostname',
						translateTime: true,
				  },
		},
	});

	app.register(plugins.configPlugin);
	app.register(plugins.databasePlugin);
	app.register(cookiePlugin, {
		parseOptions: { httpOnly: true },
	});

	app.register(plugins.hashPlugin);
	app.register(plugins.authPlugin);

	for (const schema of [
		...productSchemas,
		...userSchemas,
		defaulFieldsSchema,
	]) {
		app.addSchema(schema);
	}

	app.register(userPlugin);
	app.register(productPlugin);

	app.ready();
	return app;
}
