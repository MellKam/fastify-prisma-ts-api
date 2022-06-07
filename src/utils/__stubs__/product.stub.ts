import type { Product } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/en';
import { randomUUID } from 'crypto';

/**
 * @param amount
 * amount of products that you want to create
 * @default 1
 *
 * @param ownerId
 * array of owner IDs that will be randomly passed to products or just one id(string)
 *
 * @returns array of products
 */
export const getFakeProducts = (
	amount = 1,
	ownerId?: string | string[],
): Product[] => {
	const products: Product[] = [];

	let getOwnerId: () => string;

	switch (typeof ownerId) {
		case 'string':
			getOwnerId = () => ownerId;
			break;
		case 'object':
			getOwnerId = () =>
				ownerId[faker.datatype.number({ max: ownerId.length - 1 })];
			break;
		default:
			getOwnerId = () => randomUUID();
			break;
	}

	for (let i = 1; i <= amount; i++) {
		products.push({
			id: randomUUID(),
			title: faker.commerce.productName(),
			content: faker.commerce.productDescription(),
			price: +faker.commerce.price(),
			ownerId: getOwnerId(),
			createdAt: faker.datatype.datetime(),
			updatedAt: faker.datatype.datetime(),
		});
	}
	return products;
};
