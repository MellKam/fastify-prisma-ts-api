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

export const prismaClientMock = client as DeepMockProxy<PrismaClient>;
