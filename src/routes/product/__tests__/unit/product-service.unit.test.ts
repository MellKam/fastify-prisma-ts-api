import { ProductService } from '../../product.service';
import { getFakeProducts } from '../../../../utils/__stubs__/product.stub';
import { describe, it, vi, expect } from 'vitest';
import prismaClient from '../../../../plugins/database/prisma/prisma-client.js';

vi.mock('../../../../plugins/database/prisma/prisma-client.js');

describe('productService unitTests', () => {
	const productService = new ProductService(prismaClient.product);

	it('must create product', async () => {
		const product = getFakeProducts(1)[0];
		const createProductSpy = vi
			.spyOn(prismaClient.product, 'create')
			.mockResolvedValue(product);

		const createProductData = {
			title: product.title,
			price: product.price,
		};

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
