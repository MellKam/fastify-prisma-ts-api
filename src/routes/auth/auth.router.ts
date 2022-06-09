import { FastifyPluginCallback } from 'fastify';
import { publicUserRef } from '../user/user.schema.js';
import { AuthController } from './auth.controller.js';
import {
	accessTokenResRef,
	localLoginReqRef,
	localRegisterReqRef,
} from './auth.schema.js';

export const authRouter: FastifyPluginCallback = (fastify, _opts, done) => {
	const authController = new AuthController(fastify.authService);

	fastify.route({
		method: 'POST',
		url: '/local/register',
		schema: {
			body: localRegisterReqRef,
			response: {
				201: publicUserRef,
			},
		},
		handler: authController.localRegister,
	});

	fastify.route({
		method: 'POST',
		url: '/local/login',
		schema: {
			body: localLoginReqRef,
			response: {
				200: accessTokenResRef,
			},
		},
		handler: authController.localLogin,
	});

	fastify.route({
		method: 'PATCH',
		url: '/access_token/refresh',
		schema: {
			response: {
				200: accessTokenResRef,
			},
		},
		preHandler: fastify.jwtGuard,
		handler: authController.refreshAccessToken,
	});

	fastify.route({
		method: 'PATCH',
		url: '/refresh_token/revoke',
		preHandler: fastify.jwtGuard,
		handler: authController.revokeRefreshToken,
	});

	// TODO logout

	fastify.route({
		method: 'GET',
		url: '/google/uri',
		handler: authController.getGoogleAuthUrl,
	});

	fastify.route({
		method: 'GET',
		url: '/google',
		schema: {
			response: accessTokenResRef,
		},
		handler: authController.googleAuthHandler,
	});

	done();
};
