import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddentError } from '../../utils/http-errors.js';
import { localLoginReqType, localRegisterReqType } from './auth.schema.js';
import { AuthService } from './auth.service.js';

const REFRESH_TOKEN = 'refresh_token';

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async localRegister(
		req: FastifyRequest<{ Body: localRegisterReqType }>,
		reply: FastifyReply,
	) {
		const result = await this.authService.localRegister(req.body);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.status(201).send(result);
	}

	async localLogin(
		req: FastifyRequest<{ Body: localLoginReqType }>,
		reply: FastifyReply,
	) {
		const result = await this.authService.localLogin(req.body);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.setCookie(REFRESH_TOKEN, result.refreshToken, {
			path: '/api/auth/',
		});

		reply.status(200).send(result);
	}

	async revokeRefreshToken(req: FastifyRequest, reply: FastifyReply) {
		const refreshToken = req.cookies[REFRESH_TOKEN];
		if (!refreshToken) {
			return reply.send(new ForbiddentError('Not found refreshToken'));
		}

		const result = await this.authService.revokeRefreshToken(refreshToken);
		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.setCookie(REFRESH_TOKEN, result);
		reply.status(200).send();
	}

	async refreshAccessToken(req: FastifyRequest, reply: FastifyReply) {
		const refreshToken = req.cookies[REFRESH_TOKEN];

		const result = await this.authService.refreshAccessToken(refreshToken);
		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.send({ accessToken: result });
	}

	getGoogleAuthUrl(_req: FastifyRequest, reply: FastifyReply) {
		const url = this.authService.getGoogleAuthUrl();

		reply.send({ url });
	}

	async googleAuthHandler(
		req: FastifyRequest<{ Querystring: { code: string } }>,
		reply: FastifyReply,
	) {
		const result = await this.authService.verifyGoogleUser(req.query.code);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.setCookie(REFRESH_TOKEN, result.refreshToken, {
			path: '/api/auth',
		});

		reply.status(200).send(result);
	}
}
