import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @IsString()
  userId!: string;

  @IsEnum(InteractionType)
  type!: InteractionType;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  productId?: string;
}