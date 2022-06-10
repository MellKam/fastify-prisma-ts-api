import buildApp from '../../../../app';
import { getFakeProducts } from '../../../../utils/__stubs__/product.stub.js';
import { getFakeUsers } from '../../../../utils/__stubs__/user.stub.js';

describe('createProduct', () => {
	let app: Awaited<ReturnType<typeof buildApp>>;

	beforeAll(async () => {
		try {
			app = await buildApp();
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	});

	it('must work', async () => {
		const user = getFakeUsers()[0];
		const products = getFakeProducts(5, user.id);

		await app.db.user.create({ data: user });
		await app.db.product.createMany({ data: products });

		const response = await app.inject({ method: 'GET', url: '/api/product' });

		expect(response.statusCode).toBe(200);
		expect(JSON.parse(response.body)).toEqual(
			JSON.parse(JSON.stringify(products)),
		);
	});

	afterAll(async () => {
		await app.db.product.deleteMany({});
		await app.db.user.deleteMany({});
		await app.close();
	});
});
