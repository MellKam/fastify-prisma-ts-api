import fastify from 'fastify';
import dotenv from 'dotenv';
import * as plugins from './plugins/index.js';
import cookiePlugin from '@fastify/cookie';
import { getEnvFileName, isProductionEnv } from './utils/environment.js';
import { HttpError, InternalServerError } from './utils/http-errors.js';
import { apiSchemas, apiRouter } from './routes/api.js';
import {
	ajvTypeBoxPlugin,
	TypeBoxTypeProvider,
} from './utils/typebox.provider.js';

dotenv.config({ path: getEnvFileName() });

export default async function buildApp() {
	const app = fastify({
		ajv: {
			customOptions: {
				strict: 'log',
			},
			plugins: [ajvTypeBoxPlugin],
		},
		logger: {
			transport: isProductionEnv
				? undefined
				: {
						target: 'pino-pretty',
						options: {
							translateTime: 'HH:MM:ss Z',
							ignore: 'pid,hostname',
						},
				  },
		},
	}).withTypeProvider<TypeBoxTypeProvider>();

	await app.register(plugins.configPlugin);
	await app.register(plugins.databasePlugin);
	await app.register(plugins.corsPlugin);
	await app.register(plugins.httpPlugin);

	await app.register(cookiePlugin, {
		parseOptions: { httpOnly: true },
	});

	await app.register(plugins.hashPlugin);
	await app.register(plugins.authPlugin);

	for (const schema of apiSchemas) {
		app.addSchema(schema);
	}

	await app.register(apiRouter, { prefix: 'api' });

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

	await app.ready();
	return app;
}
