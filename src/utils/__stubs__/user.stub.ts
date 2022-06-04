import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';

/**
 * @param amount
 * amount of users that you want to create
 * @default 1
 *
 * @returns array of users
 */
export const getFakeUsers = (amount = 1): User[] => {
	const users: User[] = [];

	for (let i = 1; i <= amount; i++) {
		users.push({
			id: i,
			email: faker.internet.email(),
			name: faker.internet.userName(),
			password: faker.internet.password(),
			salt: faker.internet.password(),
			createdAt: faker.datatype.datetime(),
			updatedAt: faker.datatype.datetime(),
			tokenVersion: 0,
		});
	}

	return users;
};
