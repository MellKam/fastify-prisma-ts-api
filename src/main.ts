import buildApp from './app.js';

const bootstrap = async () => {
	try {
		const app = await buildApp();

		await app.listen({ port: app.config.PORT });
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

bootstrap();
