import { buildApp } from './app';
import { defaultConfig } from './plugins/config/config.service';

const bootstrap = async () => {
	try {
		const app = buildApp();

		const PORT = process.env.PORT ? +process.env.PORT : defaultConfig.PORT;

		await app.listen({ port: PORT });
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

bootstrap();
