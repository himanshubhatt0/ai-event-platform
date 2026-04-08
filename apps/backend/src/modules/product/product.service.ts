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

      // ✅ 2. Create Product in DB (SOURCE OF TRUTH)
      const product = await this.prisma.product.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          price,
          organizationId,
        },
      });

      // ✅ 3. Generate Embedding (AI)
      const embedding = await getEmbedding(
        `${title.trim()} ${description.trim()}`,
      );

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
      } catch (err) {
        // ⚠️ DO NOT FAIL API (production-safe)
        console.error('Pinecone upsert failed for product:', err);
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

  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}