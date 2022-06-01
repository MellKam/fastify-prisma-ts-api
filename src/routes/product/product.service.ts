import { Prisma } from '@prisma/client';
import { ConflictError, InternalServerError } from '../../utils/http-errors';
import { ICreateProductReq } from './product.schema';

export class ProductService {
	constructor(
		private readonly productRepository: Prisma.ProductDelegate<undefined>,
	) {}

	async create(productData: ICreateProductReq, ownerId: number) {
		try {
			return await this.productRepository.create({
				data: { ...productData, ownerId },
			});
		} catch (error: any) {
			if (error.code === 'P2003') {
				return new ConflictError('User with this id does not exist');
			}
			return new InternalServerError(error);
		}
	}

	async deleteUserProduct(productId: number, ownerId: number) {
		try {
			const result = await this.productRepository.deleteMany({
				where: { AND: { id: productId, ownerId } },
			});
			if (!result.count) {
				return new ConflictError(
					`Product #${productId} do not exist or not belong to User #${ownerId}`,
				);
			}
			return result;
		} catch (error: any) {
			return new InternalServerError(error);
		}
	}

	async findOne(productId: number) {
		try {
			const product = await this.productRepository.findUnique({
				where: { id: productId },
			});

			if (product === null) {
				return new ConflictError('Product with this id does not exist');
			}
			return product;
		} catch (error) {
			return new InternalServerError(error);
		}
	}

	async findAll(ownerId?: number) {
		try {
			const where: Prisma.ProductWhereInput = {};

			if (ownerId) where.ownerId = ownerId;

			return await this.productRepository.findMany({ where });
		} catch (error) {
			return new InternalServerError(error);
		}
	}
}
