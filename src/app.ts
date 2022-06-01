import fastify from 'fastify';
import authPlugin from './plugins/auth/auth.plugin';
import { configPlugin } from './plugins/config/config.plugin';
import hashPlugin from './plugins/hash/hash.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';
import productPlugin from './routes/product/product.plugin';
import { productSchemas } from './routes/product/product.schema';
import userPlugin from './routes/user/user.plugin';
import { userSchemas } from './routes/user/user.schema';
import { defaulFieldsSchema } from './utils/defautl-model-fileds';
import cookiePlugin from '@fastify/cookie';

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
	app.register(cookiePlugin, {
		parseOptions: { httpOnly: true },
	});

	app.register(hashPlugin);
	app.register(authPlugin);

	for (const schema of [
		...productSchemas,
		...userSchemas,
		defaulFieldsSchema,
	]) {
		app.addSchema(schema);
	}

	app.register(userPlugin);
	app.register(productPlugin);

	return app;
}
