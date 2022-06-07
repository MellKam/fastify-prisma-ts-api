import { DEFAULT_FILEDS_SCHEMA } from '../../utils/defautl-model-fileds.js';

export const CREATE_PRODUCE_REQ_SCHEMA_ID = 'createProductReqSchema';
export const GET_PRODUCTS_RES_SCHEMA_ID = 'getProductsResSchema';
export const GET_PRODUCTS_QUERY_SCHEMA = 'getProductsQuerySchema';
export const PRODUCT_SCHEMA_ID = 'productSchema';

const createProductReqSchema = {
	$id: CREATE_PRODUCE_REQ_SCHEMA_ID,
	type: 'object',
	properties: {
		title: { type: 'string' },
		content: { type: 'string', nullable: true },
		price: { type: 'number' },
	},
	required: ['title', 'price'],
	additionalProperties: false,
};

const productSchema = {
	$id: PRODUCT_SCHEMA_ID,
	type: 'object',
	allOf: [
		{ $ref: DEFAULT_FILEDS_SCHEMA },
		{ $ref: CREATE_PRODUCE_REQ_SCHEMA_ID },
		{ $ref: '#/definitions/ownerIdProperty' },
	],
	definitions: {
		ownerIdProperty: {
			properties: {
				ownerId: { type: 'string' },
			},
			required: ['ownerId'],
		},
	},
	additionalProperties: false,
};

const getProductsResSchema = {
	$id: GET_PRODUCTS_RES_SCHEMA_ID,
	type: 'array',
	items: { $ref: PRODUCT_SCHEMA_ID },
};

export interface ICreateProductReq {
	title: string;
	content?: string;
	price: number;
}

export const productSchemas = [
	productSchema,
	createProductReqSchema,
	getProductsResSchema,
];
