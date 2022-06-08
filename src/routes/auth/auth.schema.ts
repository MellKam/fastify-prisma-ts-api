export const REGISTER_USER_REQ_SCHEMA = 'registerUserReqSchema';
export const LOGIN_USER_REQ_SCHEMA = 'loginUserReqSchema';
export const ACCESS_TOKEN_RES_SCHEMA = 'accessTokenResSchema';

const registerUserReqSchema = {
	$id: REGISTER_USER_REQ_SCHEMA,
	type: 'object',
	properties: {
		email: { type: 'string', format: 'email' },
		name: { type: 'string' },
		password: { type: 'string', minLength: 6 },
	},
	required: ['email', 'password'],
	additionalProperties: false,
};

const loginUserReqSchema = {
	$id: LOGIN_USER_REQ_SCHEMA,
	type: 'object',
	properties: {
		email: { type: 'string', format: 'email' },
		password: { type: 'string' },
	},
	required: ['email', 'password'],
	additionalProperties: false,
};

const accessTokenResSchema = {
	$id: ACCESS_TOKEN_RES_SCHEMA,
	type: 'object',
	properties: {
		accessToken: { type: 'string' },
	},
	required: ['accessToken'],
	additionalProperties: false,
};

export interface IRegisterUserReq {
	email: string;
	name?: string;
	password: string;
}

export interface ILoginUserReq {
	email: string;
	password: string;
}

export const authSchemas = [
	registerUserReqSchema,
	loginUserReqSchema,
	accessTokenResSchema,
];
