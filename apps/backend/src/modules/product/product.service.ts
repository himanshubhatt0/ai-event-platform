import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PRODUCT_CONSTANTS } from './product.constants';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { title, description, price, organizationId } = data;

    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          PRODUCT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return await this.prisma.product.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          price,
          organizationId,
        },
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
        );
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }

  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
