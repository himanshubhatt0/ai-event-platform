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

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: CreateEventDto): Promise<Event> {
    const { title, description, date, organizationId } = data;

    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          EVENT_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return await this.prisma.event.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          organizationId,
        },
      });
    } catch (error: unknown) {
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

  async getEvents(): Promise<Event[]> {
    return this.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
