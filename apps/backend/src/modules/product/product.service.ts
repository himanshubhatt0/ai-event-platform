import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PRODUCT_CONSTANTS } from './product.constants';
import { getEmbedding } from 'src/common/utils/ai.service';
import { deleteVectorById, index } from 'src/common/utils/pinecone.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async upsertProductVector(product: Pick<Product, 'id' | 'title' | 'description' | 'price'>) {
    const embedding = await getEmbedding(
      `${product.title.trim()} ${product.description.trim()}`,
    );

    await index.upsert({
      records: [
        {
          id: product.id,
          values: embedding,
          metadata: {
            type: 'product',
            title: product.title.trim(),
            description: product.description.trim(),
            price: product.price,
          },
        },
      ],
    });
  }

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
          organizationId: organizationId!,
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

  async updateProduct(productId: string, data: Partial<CreateProductDto>, callerOrgId: string): Promise<Product> {
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

      if (existingProduct.organizationId !== callerOrgId) {
        throw new ForbiddenException('You can only update products belonging to your organization');
      }

      const previousSnapshot = {
        title: existingProduct.title,
        description: existingProduct.description,
        price: existingProduct.price,
      };

      const updateData: Prisma.ProductUpdateInput = {};
      if (data.title) updateData.title = data.title.trim();
      if (data.description) updateData.description = data.description.trim();
      if (data.price !== undefined) updateData.price = data.price;

      const updatedProduct = await this.prisma.product.update({
        where: { id: productId.trim() },
        data: updateData,
      });

      try {
        await this.upsertProductVector(updatedProduct);
      } catch (pineconeError) {
        try {
          await this.prisma.product.update({
            where: { id: productId.trim() },
            data: previousSnapshot,
          });
        } catch (rollbackError) {
          console.error('Failed to rollback product after Pinecone update failure:', rollbackError);
        }

        console.error('Pinecone sync failed for updated product:', pineconeError);
        throw new InternalServerErrorException(
          PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
        );
      }

      return updatedProduct;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof InternalServerErrorException) throw error;

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

  async deleteProduct(productId: string, callerOrgId: string): Promise<Product> {
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

      if (existingProduct.organizationId !== callerOrgId) {
        throw new ForbiddenException('You can only delete products belonging to your organization');
      }

      try {
        await deleteVectorById(existingProduct.id);
      } catch (pineconeError) {
        console.error('Pinecone delete failed for product:', pineconeError);
        throw new InternalServerErrorException(
          PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
        );
      }

      try {
        const deletedProduct = await this.prisma.$transaction(async (tx) => {
          await tx.interaction.deleteMany({
            where: { productId: productId.trim() },
          });

          return await tx.product.delete({
            where: { id: productId.trim() },
          });
        });

        return deletedProduct;
      } catch (dbError) {
        try {
          await this.upsertProductVector(existingProduct);
        } catch (restoreError) {
          console.error('Failed to restore product vector after DB delete failure:', restoreError);
        }

        throw dbError;
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof InternalServerErrorException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        PRODUCT_CONSTANTS.ERRORS.PRODUCT_CREATION_FAILED,
      );
    }
  }
}