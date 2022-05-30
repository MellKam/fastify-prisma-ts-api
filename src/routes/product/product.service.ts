import { Prisma } from '@prisma/client';
import { ConflictError, InternalServerError } from '../../utils/http-errors';
import { ICreateProductReq } from './product.schema';

export class ProductService {
	constructor(
		private readonly productRepository: Prisma.ProductDelegate<undefined>,
	) {}

	async createProduct(data: ICreateProductReq) {
		try {
			return await this.productRepository.create({ data });
		} catch (error: any) {
			if (error.code === 'P2003') {
				return new ConflictError('User with this id does not exist');
			}
			return new InternalServerError(error);
		}
	}

	async deleteOne(productId: number) {
		try {
			return await this.productRepository.delete({ where: { id: productId } });
		} catch (error: any) {
			if (error.code === 'P2025') {
				return new ConflictError('Product with this id does not exist');
			}
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

	async findAll() {
		try {
			return await this.productRepository.findMany();
		} catch (error) {
			return new InternalServerError(error);
		}
	}
}
