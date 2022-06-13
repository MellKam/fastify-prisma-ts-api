import { FastifyPluginCallback } from 'fastify';
import { publicUserRef } from '../user/user.schema.js';
import { AuthController } from './auth.controller.js';
import {
	accessTokenResRef,
	googleUrlResRef,
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
		url: '/refresh',
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
		url: '/logout',
		preHandler: fastify.jwtGuard,
		handler: authController.logout,
	});

	fastify.route({
		method: 'GET',
		url: '/google/url',
		schema: {
			response: {
				200: googleUrlResRef,
			},
		},
		handler: authController.getGoogleAuthUrl,
	});

	fastify.route({
		method: 'GET',
		url: '/google/callback',
		schema: {
			response: {
				200: accessTokenResRef,
			},
		},
		handler: authController.googleAuthHandler,
	});

	fastify.route({
		method: 'GET',
		url: '/activation',
		schema: {
			querystring: { type: 'object', properties: { code: { type: 'string' } } },
		},
		handler: authController.activateAccount,
	});

	// TODO resend activation mail

	done();
};
