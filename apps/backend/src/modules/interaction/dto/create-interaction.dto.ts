import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @IsEnum(InteractionType)
  type!: InteractionType;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}