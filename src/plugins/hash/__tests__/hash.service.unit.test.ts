import bcrypt from 'bcryptjs';
import { HashService } from '../hash.service.js';
import { faker } from '@faker-js/faker';
import { getRandomHash } from '../../../utils/__stubs__/hash.stub.js';
import { vi, describe, beforeEach, expect, it } from 'vitest';

describe('HashService', () => {
	const SALT_ROUNDS = 5;
	const hashService = new HashService(bcrypt, SALT_ROUNDS);
	let testHash: string;
	let testSalt: string;
	let userPassword: string;

	beforeEach(() => {
		userPassword = faker.internet.password();
		testHash = getRandomHash();
		testSalt = getRandomHash();
	});

	describe('hashPassword', () => {
		it('hashPassword', async () => {
			bcrypt.hash = vi.fn().mockResolvedValue(testHash);
			bcrypt.genSalt = vi.fn().mockResolvedValue(testSalt);

			const result = await hashService.hashPassword(userPassword);

			expect(bcrypt.genSalt).toBeCalledWith(SALT_ROUNDS);
			expect(bcrypt.hash).toBeCalledWith(userPassword, testSalt);

			expect(result.hash).toBe(testHash);
			expect(result.salt).toBe(testSalt);
		});
	});

	describe('validatePassword', () => {
		it('must return true', async () => {
			bcrypt.hash = vi.fn().mockResolvedValue(testHash);

			const result = await hashService.validatePassword(
				userPassword,
				testHash,
				testSalt,
			);

			expect(bcrypt.hash).toBeCalledWith(userPassword, testSalt);

			expect(result).toBe(true);
		});

		it('must return false', async () => {
			const differentHash = getRandomHash();
			bcrypt.hash = vi.fn().mockImplementation((_s, _salt) => differentHash);

			const result = await hashService.validatePassword(
				userPassword,
				testHash,
				testSalt,
			);

			expect(result).toBe(false);
		});
	});
});
