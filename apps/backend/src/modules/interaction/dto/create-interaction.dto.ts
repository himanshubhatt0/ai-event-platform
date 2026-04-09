import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @ApiProperty({
    enum: InteractionType,
    enumName: 'InteractionType',
    example: InteractionType.LIKE,
    description: 'Type of interaction the user performed.',
  })
  @IsEnum(InteractionType)
  type!: InteractionType;

  @ApiPropertyOptional({
    format: 'uuid',
    example: 'f177fd76-df57-4e9d-a4dc-a0f438f22f0d',
    description: 'Event id when interaction is against an event.',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    example: '24be9a7a-cf47-4a9a-9a7f-9161948fba10',
    description: 'Product id when interaction is against a product.',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;
}