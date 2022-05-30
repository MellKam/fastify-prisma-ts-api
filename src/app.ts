import fastify from 'fastify';
import { configPlugin } from './plugins/config.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';
import productPlugin from './routes/product/product.plugin';
import { productSchemas } from './routes/product/product.schema';
import { defaulFieldsSchema } from './utils/defautl-model-fileds';

export function buildApp() {
	const app = fastify({
		logger: {
			prettyPrint: {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: true,
			},
		},
	});

	app.register(configPlugin);
	app.register(prismaPlugin);

	for (const schema of [...productSchemas, defaulFieldsSchema]) {
		app.addSchema(schema);
	}

	app.register(productPlugin);

	return app;
}
