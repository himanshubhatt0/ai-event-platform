import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Event } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_CONSTANTS } from './event.constants';
import { index } from 'src/common/utils/pinecone.service';
import { getEmbedding } from 'src/common/utils/ai.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: CreateEventDto): Promise<Event> {
    const { title, description, date, organizationId } = data;

    try {
      // ✅ 1. Validate Organization
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          EVENT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      // ✅ 2. Generate Embedding (AI)
      const embedding = await getEmbedding(
        `${title.trim()} ${description.trim()}`,
      );

      // ✅ 3. Create Event in DB (SOURCE OF TRUTH)
      const event = await this.prisma.event.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          organizationId: organizationId!,
        },
      });

      // ✅ 4. Store in Pinecone (VECTOR DB)
      try {
        await index.upsert({
          records: [
            {
              id: event.id,
              values: embedding,
              metadata: {
                type: 'event',
                title: title.trim(),
                description: description.trim(),
              },
            },
          ],
        });
      } catch (upsertError) {
        console.error('Pinecone upsert failed for event:', upsertError);

        try {
          await this.prisma.event.delete({ where: { id: event.id } });
        } catch (rollbackError) {
          console.error(
            'Failed to rollback event after Pinecone failure:',
            rollbackError,
          );
        }

        throw new InternalServerErrorException(
          EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
        );
      }

      return event;
    } catch (error: unknown) {
      // ✅ Preserve your error handling style
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
        );
      }

      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }
}
