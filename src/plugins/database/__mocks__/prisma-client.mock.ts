import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import client from '../prisma-client.js';

jest.mock('../prisma-client', () => ({
	__esModule: true,
	default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
	mockReset(prismaClientMock);
});

// in prisma docs was written like this
// export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
// if it brokes, maybe i need go back to this code, but i think it will work)
export const prismaClientMock =
	client as unknown as DeepMockProxy<PrismaClient>;
