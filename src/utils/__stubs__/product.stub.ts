import type { Product } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/en';

/**
 * @param amount
 * amount of products that you want to create
 * @default 1
 *
 * @param ownerIds
 * array of owner IDs that will be randomly passed to products
 * @default [1]
 *
 * @returns array of products
 */
export const getFakeProducts = (amount = 1, ownerIds = [1]): Product[] => {
	const products: Product[] = [];
	const ownerRandomRange = { max: ownerIds.length - 1 };

	for (let i = 1; i <= amount; i++) {
		products.push({
			id: i,
			title: faker.commerce.productName(),
			content: faker.commerce.productDescription(),
			price: +faker.commerce.price(),
			ownerId: ownerIds[faker.datatype.number(ownerRandomRange)],
			createdAt: faker.datatype.datetime(),
			updatedAt: faker.datatype.datetime(),
		});
	}
	return products;
};
