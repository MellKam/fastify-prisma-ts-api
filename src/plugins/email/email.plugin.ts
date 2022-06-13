import plugin from 'fastify-plugin';
import { AUTH_PLUGIN, CONFIG_PLUGIN, MAIL_PLUGIN } from '../plugin-names.js';
import nodemailer from 'nodemailer';

export const mailPlugin = plugin(
	async (fastify) => {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAUTH2',
				user: fastify.config.GMAIL_ADDRESS,
				clientId: fastify.config.GOOGLE_OAUTH_CLIENT_ID,
				clientSecret: fastify.config.GOOGLE_OAUTH_CLIENT_SECRET,
				refreshToken: fastify.config.GMAIL_REFRESH_TOKEN,
			},
			options: {
				from: fastify.config.GMAIL_ADDRESS,
			},
		});

		fastify.decorate('transporter', transporter);
	},
	{
		name: MAIL_PLUGIN,
		dependencies: [CONFIG_PLUGIN, AUTH_PLUGIN],
	},
);
