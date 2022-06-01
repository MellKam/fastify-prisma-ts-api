import { DEFAULT_FILEDS_SCHEMA } from '../../utils/defautl-model-fileds';

export const REGISTER_USER_REQ_SCHEMA_ID = 'registerUserReqSchema';
export const PUBLIC_USER_SCHEMA = 'publicUserSchema';
export const LOGIN_USER_REQ_SCHEMA_ID = 'loginUserReqSchema';
export const LOGIN_USER_RES_SCHEMA_ID = 'loginUserResSchema';

const createUserReqSchema = {
	$id: REGISTER_USER_REQ_SCHEMA_ID,
	type: 'object',
	properties: {
		email: { type: 'string', format: 'email' },
		name: { type: 'string' },
		password: { type: 'string', minLength: 6 },
	},
	required: ['email', 'password'],
	additionalProperties: false,
};

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

const loginUserReqSchema = {
	$id: LOGIN_USER_REQ_SCHEMA_ID,
	type: 'object',
	properties: {
		email: { type: 'string', format: 'email' },
		password: { type: 'string' },
	},
	required: ['email', 'password'],
	additionalProperties: false,
};

const loginUserResSchema = {
	$id: LOGIN_USER_RES_SCHEMA_ID,
	type: 'object',
	properties: {
		accessToken: { type: 'string' },
	},
	required: ['accessToken'],
	additionalProperties: false,
};

export interface ICreateUserReq {
	email: string;
	name?: string;
	password: string;
}

export interface ILoginUserReq {
	email: string;
	password: string;
}

export const userSchemas = [
	createUserReqSchema,
	publicUserSchema,
	loginUserReqSchema,
	loginUserResSchema,
];
