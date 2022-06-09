import { Type, Static } from '@sinclair/typebox';
import { Nullable } from '../../utils/typebox.provider.js';

const publicUserSchema = Type.Object(
	{
		id: Type.String({ format: 'uuid' }),
		createdAt: Type.String({ format: 'date-time' }),
		updatedAt: Type.String({ format: 'date-time' }),
		email: Type.String(),
		name: Nullable(Type.String()),
		locale: Nullable(Type.String()),
	},
	{
		$id: 'publicUserSchema',
		additionalProperties: false,
	},
);

export const publicUserRef = Type.Ref(publicUserSchema);
export type publicUserType = Static<typeof publicUserSchema>;

export const userSchemas = [publicUserSchema];
