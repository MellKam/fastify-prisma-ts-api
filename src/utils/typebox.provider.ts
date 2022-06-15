import { TSchema, Type } from '@sinclair/typebox';
import Ajv from 'ajv';

// export interface TypeBoxTypeProvider extends FastifyTypeProvider {
// 	output: this['input'] extends TSchema ? Static<this['input']> : never;
// }

export const ajvTypeBoxPlugin = function (ajv: Ajv) {
	ajv.addKeyword({ keyword: 'kind' });
	ajv.addKeyword({ keyword: 'modifier' });
};

export const Nullable = <T extends TSchema>(type: T) =>
	Type.Union([type, Type.Null()]);
