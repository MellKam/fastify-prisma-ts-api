import { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError, UnauthorizedError } from '../../utils/http-errors.js';
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
		try {
			const result = await this.authService.localRegister(req.body);

			return reply.status(201).send(result);
		} catch (error) {
			return reply.send(error);
		}
	}

	async localLogin(
		req: FastifyRequest<{ Body: localLoginReqType }>,
		reply: FastifyReply,
	) {
		try {
			const result = await this.authService.localLogin(req.body);

			reply.setCookie(REFRESH_TOKEN, result.refreshToken, {
				path: REFRESH_TOKEN_ALLOWED_PATH,
			});

			return reply.status(200).send(result);
		} catch (error) {
			return reply.send(error);
		}
	}

	async refreshAccessToken(req: FastifyRequest, reply: FastifyReply) {
		try {
			const refreshToken = req.cookies[REFRESH_TOKEN];
			const result = await this.authService.refreshAccessToken(refreshToken);

			return reply.status(200).send({ accessToken: result });
		} catch (error) {
			return reply.send(error);
		}
	}

	getGoogleAuthUrl(_req: FastifyRequest, reply: FastifyReply) {
		const url = this.authService.getGoogleAuthUrl();

		return reply.status(200).send({ url });
	}

	async googleAuthHandler(
		req: FastifyRequest<{ Querystring: { code: string } }>,
		reply: FastifyReply,
	) {
		try {
			const result = await this.authService.loginWithGoogle(req.query.code);

			reply.setCookie(REFRESH_TOKEN, result.refreshToken, {
				path: REFRESH_TOKEN_ALLOWED_PATH,
			});

			return reply.status(200).send(result);
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

	async activateAccount(
		req: FastifyRequest<{ Querystring: { code: string } }>,
		reply: FastifyReply,
	) {
		try {
			const result = await this.authService.activateAccountByCode(
				req.query.code,
			);
			if (!result) {
				return reply.send(
					new BadRequestError('User already has activated account'),
				);
			}

			return reply.status(204).send();
		} catch (error) {
			return reply.send(error);
		}
	}
}
