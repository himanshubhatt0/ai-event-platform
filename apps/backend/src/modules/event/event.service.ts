import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Event } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EVENT_CONSTANTS } from './event.constants';
import { deleteVectorById, index } from 'src/common/utils/pinecone.service';
import { getEmbedding } from 'src/common/utils/ai.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) { }

  private async upsertEventVector(event: Pick<Event, 'id' | 'title' | 'description'>) {
    const embedding = await getEmbedding(
      `${event.title.trim()} ${event.description.trim()}`,
    );

    await index.upsert({
      records: [
        {
          id: event.id,
          values: embedding,
          metadata: {
            type: 'event',
            title: event.title.trim(),
            description: event.description.trim(),
          },
        },
      ],
    });
  }

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

  async getEventsByOrganization(organizationId: string): Promise<Event[]> {
    if (!organizationId?.trim()) {
      throw new BadRequestException(EVENT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      return await this.prisma.event.findMany({
        where: { organizationId: organizationId.trim() },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }

  async getEventById(eventId: string): Promise<Event> {
    if (!eventId?.trim()) {
      throw new BadRequestException(EVENT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId.trim() },
      });

      if (!event) {
        throw new NotFoundException(EVENT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      return event;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }

  async updateEvent(eventId: string, data: Partial<CreateEventDto>, callerOrgId: string): Promise<Event> {
    if (!eventId?.trim()) {
      throw new BadRequestException(EVENT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingEvent = await this.prisma.event.findUnique({
        where: { id: eventId.trim() },
      });

      if (!existingEvent) {
        throw new NotFoundException(EVENT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      if (existingEvent.organizationId !== callerOrgId) {
        throw new ForbiddenException('You can only update events belonging to your organization');
      }

      const previousSnapshot = {
        title: existingEvent.title,
        description: existingEvent.description,
        date: existingEvent.date,
      };

      const updateData: Prisma.EventUpdateInput = {};
      if (data.title) updateData.title = data.title.trim();
      if (data.description) updateData.description = data.description.trim();
      if (data.date) updateData.date = new Date(data.date);

      const updatedEvent = await this.prisma.event.update({
        where: { id: eventId.trim() },
        data: updateData,
      });

      try {
        await this.upsertEventVector(updatedEvent);
      } catch (pineconeError) {
        try {
          await this.prisma.event.update({
            where: { id: eventId.trim() },
            data: previousSnapshot,
          });
        } catch (rollbackError) {
          console.error('Failed to rollback event after Pinecone update failure:', rollbackError);
        }

        console.error('Pinecone sync failed for updated event:', pineconeError);
        throw new InternalServerErrorException(
          EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
        );
      }

      return updatedEvent;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof InternalServerErrorException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      return await this.prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }

  async deleteEvent(eventId: string, callerOrgId: string): Promise<Event> {
    if (!eventId?.trim()) {
      throw new BadRequestException(EVENT_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingEvent = await this.prisma.event.findUnique({
        where: { id: eventId.trim() },
      });

      if (!existingEvent) {
        throw new NotFoundException(EVENT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND);
      }

      if (existingEvent.organizationId !== callerOrgId) {
        throw new ForbiddenException('You can only delete events belonging to your organization');
      }

      try {
        await deleteVectorById(existingEvent.id);
      } catch (pineconeError) {
        console.error('Pinecone delete failed for event:', pineconeError);
        throw new InternalServerErrorException(
          EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
        );
      }

      try {
        const deletedEvent = await this.prisma.$transaction(async (tx) => {
          await tx.interaction.deleteMany({
            where: { eventId: eventId.trim() },
          });

          return await tx.event.delete({
            where: { id: eventId.trim() },
          });
        });

        return deletedEvent;
      } catch (dbError) {
        try {
          await this.upsertEventVector(existingEvent);
        } catch (restoreError) {
          console.error('Failed to restore event vector after DB delete failure:', restoreError);
        }

        throw dbError;
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof InternalServerErrorException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED);
      }

      throw new InternalServerErrorException(
        EVENT_CONSTANTS.ERRORS.EVENT_CREATION_FAILED,
      );
    }
  }
}
