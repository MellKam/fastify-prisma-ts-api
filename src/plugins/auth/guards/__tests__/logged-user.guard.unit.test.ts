import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { describe, vi, expect, it, afterEach, SpyInstanceFn } from 'vitest';
import { UnauthorizedError } from '../../../../utils/http-errors.js';
import { getRandomHash } from '../../../../utils/__stubs__/hash.stub.js';
import { JwtService } from '../../jwt/jwt.service.js';
import { AccessTokenPayload } from '../../jwt/jwt.types.js';
import { loggedUserGuard } from '../logged-user.guard.js';

describe('loggedUserGuard', () => {
	const doneFnMock = vi.fn();
	const jwtServiceMock = new JwtService({} as any, {} as any);
	const fastifyContextMock: Partial<FastifyInstance> = {
		jwtService: jwtServiceMock,
	};
	const fastifyReplyMock: Partial<FastifyReply> = {
		send: vi.fn(),
	};

	it('must verify token and assign payload to req.auth', () => {
		const accessTokenPayload: AccessTokenPayload = {
			userId: getRandomHash(),
			isActivated: true,
		};
		const accessToken = getRandomHash();
		const fastifyRequest = {
			headers: { authorization: `Bearer ${accessToken}` },
		} as FastifyRequest;

		vi.spyOn(jwtServiceMock, 'verifyToken').mockReturnValue(accessTokenPayload);

		loggedUserGuard.apply(fastifyContextMock as FastifyInstance, [
			fastifyRequest,
			fastifyReplyMock as FastifyReply,
			doneFnMock,
		]);

		expect(jwtServiceMock.verifyToken).toBeCalledWith(accessToken);
		expect(fastifyRequest.auth).toEqual(accessTokenPayload);
		expect(doneFnMock).toBeCalled();
	});

	it('must send reply with unauthorized error', () => {
		const fastifyRequest = {
			headers: {},
		} as FastifyRequest;

		loggedUserGuard.apply(fastifyContextMock as FastifyInstance, [
			fastifyRequest,
			fastifyReplyMock as FastifyReply,
			doneFnMock,
		]);

		const firstArgumetnOfReplySendCall = (
			fastifyReplyMock.send as SpyInstanceFn<any[], any>
		).mock.calls[0][0];

		expect(firstArgumetnOfReplySendCall).toBeInstanceOf(UnauthorizedError);
	});

	it('must validate token and send reply with unauthorized error', () => {
		const accessToken = getRandomHash();
		const fastifyRequest = {
			headers: { authorization: `Bearer ${accessToken}` },
		} as FastifyRequest;

		vi.spyOn(jwtServiceMock, 'verifyToken').mockReturnValue(null);

		loggedUserGuard.apply(fastifyContextMock as FastifyInstance, [
			fastifyRequest,
			fastifyReplyMock as FastifyReply,
			doneFnMock,
		]);

		const firstArgumetnOfReplySendCall = (
			fastifyReplyMock.send as SpyInstanceFn<any[], any>
		).mock.calls[0][0];

		expect(jwtServiceMock.verifyToken).toBeCalledWith(accessToken);
		expect(firstArgumetnOfReplySendCall).toBeInstanceOf(UnauthorizedError);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});
});
