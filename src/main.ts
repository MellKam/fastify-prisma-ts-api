import buildApp from './app.js';

const bootstrap = async () => {
	try {
		const app = await buildApp();

		await app.listen({ port: app.config.PORT, host: '0.0.0.0' });
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

bootstrap();
