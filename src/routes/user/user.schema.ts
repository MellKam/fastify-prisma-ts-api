import { DEFAULT_FILEDS_SCHEMA } from '../../utils/defautl-model-fileds.js';

export const PUBLIC_USER_SCHEMA = 'publicUserSchema';

const publicUserSchema = {
	$id: PUBLIC_USER_SCHEMA,
	type: 'object',
	allOf: [
		{ $ref: DEFAULT_FILEDS_SCHEMA },
		{ $ref: '#/definitions/publicUserProperties' },
	],
	definitions: {
		publicUserProperties: {
			properties: {
				email: { type: 'string', format: 'email' },
				name: {
					type: 'string',
					nullable: true,
				},
			},
			required: ['email'],
		},
	},
	additionalProperties: false,
};

export const userSchemas = [publicUserSchema];
