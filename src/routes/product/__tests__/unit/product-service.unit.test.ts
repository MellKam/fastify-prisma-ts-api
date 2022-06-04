import { ProductService } from '../../product.service';
import { prismaClientMock } from '../../../../plugins/database/__mocks__/prisma-client.mock';
import { getFakeProducts } from '../../../../utils/__stubs__/product.stub';

describe('productService unitTests', () => {
	let productService: ProductService;

	beforeAll(() => {
		productService = new ProductService(prismaClientMock.product);
	});

	test('1', async () => {
		const product = getFakeProducts(1)[0];
		prismaClientMock.product.create.mockResolvedValueOnce(product);
		const createProductSpy = jest.spyOn(prismaClientMock.product, 'create');

		const createProductData = { title: product.title, price: product.price };

		const result = await productService.create(
			createProductData,
			product.ownerId,
		);

		expect(createProductSpy).toBeCalledWith({
			data: { ...createProductData, ownerId: product.ownerId },
		});
		expect(createProductSpy).toBeCalledTimes(1);
		expect(result).toEqual(product);
	});
});
