import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Interaction } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { INTERACTION_CONSTANTS } from './interaction.constants';

@Injectable()
export class InteractionService {
  constructor(private prisma: PrismaService) {}

  async interact(data: CreateInteractionDto): Promise<Interaction> {
    const { userId, type, eventId, productId } = data;

    if (!userId) {
      throw new BadRequestException(INTERACTION_CONSTANTS.ERRORS.USER_REQUIRED);
    }

    if (!eventId && !productId) {
      throw new BadRequestException(INTERACTION_CONSTANTS.ERRORS.TARGET_REQUIRED);
    }

    try {
      // prevent duplicate interaction
      const existing = await this.prisma.interaction.findFirst({
        where: {
          userId,
          type,
          eventId: eventId ?? undefined,
          productId: productId ?? undefined,
        },
      });

      if (existing) {
        // toggle delete
        await this.prisma.interaction.delete({
          where: { id: existing.id },
        });

        return existing;
      }

      return await this.prisma.interaction.create({
        data: {
          userId,
          type,
          eventId,
          productId,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          INTERACTION_CONSTANTS.ERRORS.INTERACTION_FAILED,
        );
      }

      throw new InternalServerErrorException(
        INTERACTION_CONSTANTS.ERRORS.INTERACTION_FAILED,
      );
    }
  }
}
