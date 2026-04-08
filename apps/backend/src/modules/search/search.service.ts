import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Event, Product } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SEARCH_CONSTANTS } from './search.constants';
import { getEmbedding } from 'src/common/utils/ai.service';
import { index } from 'src/common/utils/pinecone.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) { }

  async search(query: string) {
    if (!query?.trim()) {
      throw new BadRequestException(
        SEARCH_CONSTANTS.ERRORS.QUERY_REQUIRED,
      );
    }

    try {
      // ✅ 1. Generate embedding for query
      let embedding: number[];
      try {
        embedding = await getEmbedding(query.trim());
      } catch (error: unknown) {
        console.error('SearchService OpenAI embedding failed:', error);
        throw new InternalServerErrorException(
          SEARCH_CONSTANTS.ERRORS.SEARCH_FAILED,
        );
      }

      // ✅ 2. Query Pinecone (vector similarity)
      let pineconeResult;
      try {
        pineconeResult = await index.query({
          vector: embedding,
          topK: 10,
          includeMetadata: true,
        });
      } catch (error: unknown) {
        console.error('SearchService Pinecone query failed:', error);
        throw new InternalServerErrorException(
          SEARCH_CONSTANTS.ERRORS.SEARCH_FAILED,
        );
      }

      const matches = pineconeResult.matches || [];

      if (!matches.length) {
        return [];
      }

      // ✅ 3. Extract IDs by type
      const eventIds: string[] = [];
      const productIds: string[] = [];

      matches.forEach((match) => {
        const type = match.metadata?.type;

        if (type === 'event') {
          eventIds.push(match.id);
        } else if (type === 'product') {
          productIds.push(match.id);
        }
      });

      // ✅ 4. Fetch actual data from DB
      let events: Event[] = [];
      let products: Product[] = [];

      if (eventIds.length) {
        events = await this.prisma.event.findMany({
          where: { id: { in: eventIds } },
        });
      }

      if (productIds.length) {
        products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
        });
      }

      // ✅ 5. Map DB results for quick lookup
      const eventMap = new Map(events.map((e) => [e.id, e]));
      const productMap = new Map(products.map((p) => [p.id, p]));

      // ✅ 6. Preserve Pinecone ranking order
      const results = matches
        .map((match) => {
          const type = match.metadata?.type;

          if (type === 'event') {
            const event = eventMap.get(match.id);
            return event ? { ...event, type: 'event' } : null;
          }

          if (type === 'product') {
            const product = productMap.get(match.id);
            return product ? { ...product, type: 'product' } : null;
          }

          return null;
        })
        .filter(Boolean);

      return results;
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        SEARCH_CONSTANTS.ERRORS.SEARCH_FAILED,
      );
    }
  }
}