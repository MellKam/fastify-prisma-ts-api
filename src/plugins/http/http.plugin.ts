import plugin from 'fastify-plugin';
import { FastifyPluginCallback } from 'fastify';
import { HTTP_PLUGIN } from '../plugin-names.js';
import axios from 'axios';

const httpPluginCallback: FastifyPluginCallback = (fastify, _opts, done) => {
	fastify.decorate('axios', axios.create());

	done();
};

export const httpPlugin = plugin(httpPluginCallback, { name: HTTP_PLUGIN });
