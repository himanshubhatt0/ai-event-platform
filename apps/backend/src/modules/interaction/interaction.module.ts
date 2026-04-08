import { Module } from '@nestjs/common';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [InteractionController],
  providers: [InteractionService, PrismaService]
})
export class InteractionModule { }
