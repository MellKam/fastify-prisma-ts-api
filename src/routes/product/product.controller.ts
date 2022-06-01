import { FastifyReply, FastifyRequest } from 'fastify';
import { InternalServerError } from '../../utils/http-errors';
import { ICreateProductReq } from './product.schema';
import { ProductService } from './product.service';

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
		req: FastifyRequest<{ Params: { id: number } }>,
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
			+req.params.id,
			req.auth.userId,
		);
		reply.send(result);
	}

	async findAll(
		req: FastifyRequest<{ Querystring: { ownerId?: string } }>,
		reply: FastifyReply,
	) {
		req.log.info(req.query);
		const ownerId = req.query.ownerId ? +req.query.ownerId : undefined;
		const result = await this.productService.findAll(ownerId);
		reply.send(result);
	}
}
