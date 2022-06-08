import { PrismaClient } from '@prisma/client';
import {
	BadRequestError,
	InternalServerError,
} from '../../utils/http-errors.js';

export class UserService {
	constructor(private readonly userRepository: PrismaClient['user']) {}

	async getUser(id: string) {
		try {
			const user = await this.userRepository.findUnique({ where: { id } });

			if (user === null) {
				return new BadRequestError('User with this id does not exist');
			}
			return user;
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
