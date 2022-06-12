import { Prisma, PrismaClient } from '@prisma/client';
import {
	BadRequestError,
	InternalServerError,
} from '../../utils/http-errors.js';
import { createProductReqType } from './product.schema.js';

export class ProductService {
	constructor(private readonly productRepository: PrismaClient['product']) {}

	async create(productData: createProductReqType, ownerId: string) {
		try {
			return await this.productRepository.create({
				data: { ...productData, ownerId },
			});
		} catch (error: any) {
			if (error.code === 'P2003') {
				return new BadRequestError('User with this id does not exist');
			}
			return new InternalServerError(error.message);
		}
	}

	async deleteUserProduct(productId: string, ownerId: string) {
		try {
			const result = await this.productRepository.deleteMany({
				where: { AND: { id: productId, ownerId } },
			});
			if (!result.count) {
				return new BadRequestError(
					`Product with id "${productId}" do not exist or not belong to User with id "${ownerId}"`,
				);
			}
			return true;
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async findOne(productId: string) {
		try {
			const product = await this.productRepository.findUnique({
				where: { id: productId },
			});

			if (product === null) {
				return new BadRequestError('Product with this id does not exist');
			}
			return product;
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}

	async findAll(ownerId?: string) {
		try {
			const where: Prisma.ProductWhereInput = {};

			if (ownerId) where.ownerId = ownerId;

			return await this.productRepository.findMany({ where });
		} catch (error: any) {
			return new InternalServerError(error.message);
		}
	}
}
