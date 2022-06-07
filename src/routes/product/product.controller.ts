import { FastifyReply, FastifyRequest } from 'fastify';
import { InternalServerError } from '../../utils/http-errors.js';
import { ICreateProductReq } from './product.schema.js';
import { ProductService } from './product.service.js';

export class ProductController {
	constructor(private readonly productService: ProductService) {}

	async create(
		req: FastifyRequest<{ Body: ICreateProductReq }>,
		reply: FastifyReply,
	) {
		if (!req.auth) return new InternalServerError();

		const result = await this.productService.create(req.body, req.auth.userId);

		if (result instanceof Error) {
			return reply.send(result);
		}

		reply.status(201).send(result);
	}

	async findOne(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		const result = await this.productService.findOne(req.params.id);
		reply.send(result);
	}

	async deleteOne(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		if (!req.auth) return new InternalServerError();

		const result = await this.productService.deleteUserProduct(
			req.params.id,
			req.auth.userId,
		);

		if (result === true) {
			reply.status(204).send();
			return;
		}

		reply.send(result);
	}

	async findAll(
		req: FastifyRequest<{ Querystring: { ownerId?: string } }>,
		reply: FastifyReply,
	) {
		const result = await this.productService.findAll(req.query.ownerId);
		reply.send(result);
	}
}
