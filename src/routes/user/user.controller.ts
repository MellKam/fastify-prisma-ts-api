import { FastifyReply, FastifyRequest } from 'fastify';
import {
	ForbiddentError,
	InternalServerError,
} from '../../utils/http-errors.js';
import { ICreateUserReq, ILoginUserReq } from './user.schema.js';
import { UserService } from './user.service.js';

const REFRESH_TOKEN = 'refresh_token';

export class UserController {
	constructor(private readonly userService: UserService) {}

	async register(
		req: FastifyRequest<{ Body: ICreateUserReq }>,
		reply: FastifyReply,
	) {
		const result = await this.userService.register(req.body);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.status(201).send(result);
	}

	async login(
		req: FastifyRequest<{ Body: ILoginUserReq }>,
		reply: FastifyReply,
	) {
		const result = await this.userService.login(req.body);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.setCookie(REFRESH_TOKEN, result.refreshToken, {
			path: '/user',
		});

		reply.status(200).send(result);
	}

	async revokeRefreshToken(req: FastifyRequest, reply: FastifyReply) {
		const refreshToken = req.cookies[REFRESH_TOKEN];
		if (!refreshToken) {
			return reply.send(new ForbiddentError('Not found refreshToken'));
		}

		const result = await this.userService.revokeRefreshToken(refreshToken);
		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.setCookie(REFRESH_TOKEN, result);
		reply.status(200).send();
	}

	async refreshAccessToken(req: FastifyRequest, reply: FastifyReply) {
		const refreshToken = req.cookies[REFRESH_TOKEN];

		const result = await this.userService.refreshAccessToken(refreshToken);
		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.send({ accessToken: result });
	}

	async me(req: FastifyRequest, reply: FastifyReply) {
		if (req.auth === null) return new InternalServerError();

		const result = await this.userService.getUser(req.auth.userId);

		reply.send(result);
	}
}
