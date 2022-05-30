import { DEFAULT_FILEDS_SCHEMA_ID } from '../../utils/defautl-model-fileds';

export const CREATE_PRODUCE_REQ_SCHEMA_ID = 'createProductReqSchema';
export const GET_PRODUCTS_RES_SCHEMA_ID = 'getProductsResSchema';
export const PRODUCT_SCHEMA_ID = 'productSchema';

const createProductReqSchema = {
	$id: CREATE_PRODUCE_REQ_SCHEMA_ID,
	type: 'object',
	properties: {
		title: { type: 'string' },
		content: { type: 'string' },
		price: { type: 'number' },
		ownerId: { type: 'integer' },
		additionalProperties: false,
	},
	required: ['title', 'price', 'ownerId'],
};

export interface ICreateProductReq {
	title: string;
	content: string;
	price: number;
	ownerId: number;
}

const productSchema = {
	$id: PRODUCT_SCHEMA_ID,
	type: 'object',
	allOf: [
		{ $ref: DEFAULT_FILEDS_SCHEMA_ID },
		{ $ref: CREATE_PRODUCE_REQ_SCHEMA_ID },
	],
	additionalProperties: false,
};

const getProductsResSchema = {
	$id: GET_PRODUCTS_RES_SCHEMA_ID,
	type: 'array',
	items: { $ref: PRODUCT_SCHEMA_ID },
};

export const productSchemas = [
	productSchema,
	createProductReqSchema,
	getProductsResSchema,
];
