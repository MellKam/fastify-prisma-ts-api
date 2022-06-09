import { Static, Type } from '@sinclair/typebox';

const localRegisterReqSchema = Type.Object(
	{
		email: Type.String({ format: 'email' }),
		name: Type.Optional(Type.String()),
		password: Type.String({ minLength: 6 }),
	},
	{ $id: 'localRegisterReqSchema', additionalProperties: false },
);

const localLoginReqSchema = Type.Object(
	{
		email: Type.String({ format: 'email' }),
		password: Type.String(),
	},
	{
		$id: 'localLoginReqSchema',
		additionalProperties: false,
	},
);

const accessTokenResSchema = Type.Object(
	{
		accessToken: Type.String(),
	},
	{
		$id: 'accessTokenResSchema',
		additionalProperties: false,
	},
);

export const localRegisterReqRef = Type.Ref(localRegisterReqSchema);
export type localRegisterReqType = Static<typeof localRegisterReqSchema>;
export const localLoginReqRef = Type.Ref(localLoginReqSchema);
export type localLoginReqType = Static<typeof localLoginReqSchema>;
export const accessTokenResRef = Type.Ref(accessTokenResSchema);

export const authSchemas = [
	localRegisterReqSchema,
	localLoginReqSchema,
	accessTokenResSchema,
];
