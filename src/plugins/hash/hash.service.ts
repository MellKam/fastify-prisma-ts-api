import type bcrypt from 'bcryptjs';

export type BcryptJs = typeof bcrypt;

interface HashPasswordResult {
	hash: string;
	salt: string;
}

export class HashService {
	constructor(
		private readonly bcrypt: BcryptJs,
		private readonly SALT_ROUNDS: number,
	) {}

	async hashPassword(password: string): Promise<HashPasswordResult> {
		const salt = await this.bcrypt.genSalt(this.SALT_ROUNDS);
		const hash = await this.bcrypt.hash(password, salt);

		return { hash, salt };
	}

	async validatePassword(
		candidatePassword: string,
		hash: string,
		salt: string,
	): Promise<boolean> {
		const candidateHash = await this.bcrypt.hash(candidatePassword, salt);
		return hash === candidateHash;
	}
}
