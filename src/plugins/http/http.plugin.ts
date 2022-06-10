import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { HTTP_PLUGIN } from '../plugin-names.js';
import axios from 'axios';

const httpPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	try {
		const $axios = axios.create();
		fastify.decorate('axios', $axios);

		done();
	} catch (error: any) {
		done(error);
	}
};

export const httpPlugin = plugin(httpPluginCallback, { name: HTTP_PLUGIN });
