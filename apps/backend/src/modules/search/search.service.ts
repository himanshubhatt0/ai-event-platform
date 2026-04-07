import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SEARCH_CONSTANTS } from './search.constants';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    if (!query?.trim()) {
      throw new BadRequestException(
        SEARCH_CONSTANTS.ERRORS.QUERY_REQUIRED,
      );
    }

    try {
      const q = query.toLowerCase();

      const events = await this.prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      });

      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      });

      const results = [
        ...events.map(e => ({ ...e, type: 'event' })),
        ...products.map(p => ({ ...p, type: 'product' })),
      ];

      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        SEARCH_CONSTANTS.ERRORS.SEARCH_FAILED,
      );
    }
  }
}
