import { FastifyInstance } from 'fastify';
import buildApp from '../src/app';

describe('test', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = await buildApp();
	});

	it('first', async () => {
		const response = await app.inject({ url: '/product' });
		expect(response.statusCode).toBe(200);
	});
});
