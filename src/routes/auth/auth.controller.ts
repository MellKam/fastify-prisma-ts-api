import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../../utils/http-errors.js';
import { localLoginReqType, localRegisterReqType } from './auth.schema.js';
import { AuthService } from './auth.service.js';

const REFRESH_TOKEN = 'refresh_token';
const REFRESH_TOKEN_ALLOWED_PATH = '/api/auth/refresh';

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

		return reply.status(201).send(result);
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
			path: REFRESH_TOKEN_ALLOWED_PATH,
		});

		return reply.status(200).send(result);
	}

	async refreshAccessToken(req: FastifyRequest, reply: FastifyReply) {
		const refreshToken = req.cookies[REFRESH_TOKEN];

		const result = await this.authService.refreshAccessToken(refreshToken);
		if (result instanceof Error) {
			return reply.send(result);
		}

		return reply.send({ accessToken: result });
	}

	getGoogleAuthUrl(_req: FastifyRequest, reply: FastifyReply) {
		const url = this.authService.getGoogleAuthUrl();

		return reply.send({ url });
	}

	async googleAuthHandler(
		req: FastifyRequest<{ Querystring: { code: string } }>,
		reply: FastifyReply,
	) {
		try {
			const result = await this.authService.getJwtKeypairWithGoogleCode(
				req.query.code,
			);

			return reply
				.setCookie(REFRESH_TOKEN, result.refreshToken, {
					path: REFRESH_TOKEN_ALLOWED_PATH,
				})
				.status(200)
				.send(result);
		} catch (error) {
			return reply.send(error);
		}
	}

	async logout(req: FastifyRequest, reply: FastifyReply) {
		if (req.auth === null)
			return new UnauthorizedError('You are not authorized');

		const result = await this.authService.logout(req.auth.userId);

		if (result !== undefined) {
			return reply.send(result);
		}

		return reply.clearCookie(REFRESH_TOKEN).status(204).send();
	}
}
