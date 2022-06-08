import fastify from 'fastify';
import dotenv from 'dotenv';
import * as plugins from './plugins/index.js';
import cookiePlugin from '@fastify/cookie';
import { getEnvFileName, isProductionEnv } from './utils/environment.js';
import { HttpError, InternalServerError } from './utils/http-errors.js';
import { apiSchemas, apiRouter } from './routes/api.js';
import { defaulFieldsSchema } from './utils/defautl-model-fileds.js';

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
	app.register(plugins.corsPlugin);

	app.register(cookiePlugin, {
		parseOptions: { httpOnly: true },
	});

	app.register(plugins.hashPlugin);
	app.register(plugins.authPlugin);

	for (const schema of [defaulFieldsSchema, ...apiSchemas]) {
		app.addSchema(schema);
	}

	app.register(apiRouter, { prefix: 'api' });

	app.setErrorHandler((error, _req, reply) => {
		reply.log.error(error);
		if (error instanceof HttpError || error.validation) {
			reply.send(error);
			return;
		}

		if (!isProductionEnv && (error as any)?.serialization) {
			reply.send(new InternalServerError('Serialization error'));
			return;
		}

		reply.send(new InternalServerError());
	});

	app.ready();
	return app;
}
