export const DEFAULT_FILEDS_SCHEMA_ID = 'defaultFieldsSchema';
export const defaulFieldsSchema = {
	$id: DEFAULT_FILEDS_SCHEMA_ID,
	type: 'object',
	properties: {
		id: { type: 'integer' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
	required: ['id', 'createdAt', 'updatedAt'],
	additionalProperties: false,
};

export interface IDefaultModelFields {
	id: number;
	createdAt: string;
	updatedAt: string;
}
