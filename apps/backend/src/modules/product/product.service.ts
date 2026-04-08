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
import { getEmbedding } from 'src/common/utils/ai.service';
import { index } from 'src/common/utils/pinecone.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    const { title, description, price, organizationId } = data;

    try {
      // ✅ 1. Validate Organization
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          PRODUCT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      // ✅ 2. Generate Embedding (AI)
      const embedding = await getEmbedding(
        `${title.trim()} ${description.trim()}`,
      );

      // ✅ 3. Create Product in DB (SOURCE OF TRUTH)
      const product = await this.prisma.product.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          price,
          organizationId,
        },
      });

      // ✅ 4. Store in Pinecone (VECTOR DB)
      try {
        await index.upsert({
          records: [
            {
              id: product.id,
              values: embedding,
              metadata: {
                type: 'product',
                title: title.trim(),
                description: description.trim(),
                price,
              },
            },
          ],
        });
      } catch (upsertError) {
        console.error('Pinecone upsert failed for product:', upsertError);

        try {
          await this.prisma.product.delete({ where: { id: product.id } });
        } catch (rollbackError) {
          console.error(
            'Failed to rollback product after Pinecone failure:',
            rollbackError,
          );
        }

        throw new InternalServerErrorException(
          PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
        );
      }

      return product;
    } catch (error: unknown) {
      // ✅ Preserve your error handling style
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

  async getProductsByOrganization(organizationId: string): Promise<Product[]> {
    if (!organizationId?.trim()) {
      throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      return await this.prisma.product.findMany({
        where: { organizationId: organizationId.trim() },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }

  async getProductById(productId: string): Promise<Product> {
    if (!productId?.trim()) {
      throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId.trim() },
      });

      if (!product) {
        throw new NotFoundException(PRODUCT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      return product;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }

  async updateProduct(productId: string, data: Partial<CreateProductDto>): Promise<Product> {
    if (!productId?.trim()) {
      throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: productId.trim() },
      });

      if (!existingProduct) {
        throw new NotFoundException(PRODUCT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      const updateData: any = {};
      if (data.title) updateData.title = data.title.trim();
      if (data.description) updateData.description = data.description.trim();
      if (data.price !== undefined) updateData.price = data.price;

      return await this.prisma.product.update({
        where: { id: productId.trim() },
        data: updateData,
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }

  async deleteProduct(productId: string): Promise<Product> {
    if (!productId?.trim()) {
      throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: productId.trim() },
      });

      if (!existingProduct) {
        throw new NotFoundException(PRODUCT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      await this.prisma.interaction.deleteMany({
        where: { productId: productId.trim() },
      });

      return await this.prisma.product.delete({
        where: { id: productId.trim() },
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }
}