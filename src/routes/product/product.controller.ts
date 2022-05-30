import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ICreateProductReq } from './product.schema';
import { ProductService } from './product.service';

export class ProductController {
	constructor(private readonly productService: ProductService) {}

	async create(
		req: FastifyRequest<{ Body: ICreateProductReq }>,
		reply: FastifyReply,
	) {
		const result = await this.productService.createProduct(req.body);

		const errorStatus = (result as FastifyError).statusCode;
		if (errorStatus) {
			reply.status(errorStatus).send(result);
		}
		reply.status(201).send(result);
	}

	async findOne(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		const result = await this.productService.findOne(+req.params.id);
		reply.send(result);
	}

	async deleteOne(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply,
	) {
		const result = await this.productService.deleteOne(+req.params.id);
		reply.send(result);
	}

	async findAll(_req: FastifyRequest, reply: FastifyReply) {
		const result = await this.productService.findAll();
		reply.send(result);
	}
}
