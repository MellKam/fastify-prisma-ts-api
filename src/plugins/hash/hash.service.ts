import bcrypt from 'bcrypt';

interface IHashPasswordResult {
	hash: string;
	salt: string;
}

export class HashService {
	constructor(private readonly saltRounds: number) {}

	async hashPassword(password: string): Promise<IHashPasswordResult> {
		const salt = await bcrypt.genSalt(this.saltRounds);
		const hash = await bcrypt.hash(password, salt);

		return { hash, salt };
	}

	async validatePassword(
		candidatePassword: string,
		hash: string,
		salt: string,
	): Promise<boolean> {
		const candidateHash = await bcrypt.hash(candidatePassword, salt);
		return hash === candidateHash;
	}
}
