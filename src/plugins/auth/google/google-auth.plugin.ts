import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import {
	CONFIG_PLUGIN,
	GOOGLE_AUTH_PLUGIN,
	HTTP_PLUGIN,
} from '../../plugin-names.js';
import { GoogleAuthService } from './google-auth.service.js';

const googleAuthPluginCallback: FastifyPluginCallback = (
	fastify,
	_opts,
	done,
) => {
	const googleAuthService = new GoogleAuthService(
		fastify.axios,
		fastify.config,
	);

	fastify.decorate('googleAuthService', googleAuthService);

	done();
};

export const googleAuthPlugin = plugin(googleAuthPluginCallback, {
	name: GOOGLE_AUTH_PLUGIN,
	dependencies: [CONFIG_PLUGIN, HTTP_PLUGIN],
});
