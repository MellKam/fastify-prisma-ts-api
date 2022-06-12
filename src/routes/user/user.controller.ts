import { FastifyRequest, FastifyReply } from 'fastify';
import { InternalServerError } from '../../utils/http-errors.js';
import { UserService } from './user.service.js';

export class UserController {
	constructor(private readonly userService: UserService) {}

	async me(req: FastifyRequest, reply: FastifyReply) {
		if (req.auth === null)
			return new InternalServerError('Route must be protected by authGuard');

		const result = await this.userService.getUserById(req.auth.userId);

		reply.send(result);
	}
}
