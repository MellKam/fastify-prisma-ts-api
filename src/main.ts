import { buildApp } from './app';

const bootstrap = async () => {
	try {
		const app = buildApp();
		const PORT = process.env.PORT ? +process.env.PORT : 5000;

		await app.listen({ port: PORT });
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

bootstrap();
