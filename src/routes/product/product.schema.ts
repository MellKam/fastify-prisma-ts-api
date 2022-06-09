import { Type, Static } from '@sinclair/typebox';
import { Nullable } from '../../utils/typebox.provider.js';

const createProductReqSchema = Type.Object(
	{
		title: Type.String(),
		content: Nullable(Type.String()),
		price: Type.Number(),
	},
	{
		$id: 'createProductReqSchema',
		additionalProperties: false,
	},
);

const productSchema = Type.Object(
	{
		id: Type.String({ format: 'uuid' }),
		createdAt: Type.String({ format: 'date-time' }),
		updatedAt: Type.String({ format: 'date-time' }),
		title: Type.String(),
		content: Nullable(Type.String()),
		price: Type.Number(),
		ownerId: Type.String({ format: 'uuid' }),
	},
	{ $id: 'productSchema', additionalProperties: false },
);

export const productRef = Type.Ref(productSchema);

const productsArraySchema = Type.Array(productRef, {
	$id: 'productsArraySchema',
});

export const createProductReqRef = Type.Ref(createProductReqSchema);
export type createProductReqType = Static<typeof createProductReqSchema>;
export const productsArrayRef = Type.Ref(productsArraySchema);

export const productSchemas = [
	productSchema,
	createProductReqSchema,
	productsArraySchema,
];
