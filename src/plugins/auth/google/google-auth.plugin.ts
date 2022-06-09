import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import {
	CONFIG_PLUGIN,
	GOOGLE_AUTH_PLUGIN,
	HTTP_PLUGIN,
} from '../../plugin-names.js';
import { GOOGLE_AUTH_SERVICE_DECORATOR } from '../../decorator-names.js';
import { GoogleAuthService } from './google-auth.service.js';

const googleAuthPluginCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	const googleAuthService = new GoogleAuthService(
		fastify.config.GOOGLE_OAUTH_CLIENT_ID,
		fastify.config.GOOGLE_OAUTH_CLIENT_SECRET,
		fastify.config.GOOGLE_OAUTH_REDIRECT_URL,
		fastify.axios,
	);

	fastify.decorate(GOOGLE_AUTH_SERVICE_DECORATOR, googleAuthService);

	done();
};

export const googleAuthPlugin = plugin(googleAuthPluginCallback, {
	name: GOOGLE_AUTH_PLUGIN,
	dependencies: [CONFIG_PLUGIN, HTTP_PLUGIN],
});
