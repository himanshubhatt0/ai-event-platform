import { IsNotEmpty, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EVENT_CONSTANTS } from '../event.constants';

export class CreateEventDto {
  @ApiProperty({ example: 'AI Summit 2026' })
  @IsString()
  @IsNotEmpty({ message: EVENT_CONSTANTS.ERRORS.TITLE_REQUIRED })
  @MaxLength(EVENT_CONSTANTS.VALIDATION.TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({ example: 'A one-day event about modern AI product engineering.' })
  @IsString()
  @IsNotEmpty({ message: EVENT_CONSTANTS.ERRORS.DESCRIPTION_REQUIRED })
  @MaxLength(EVENT_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH)
  description!: string;

  @ApiProperty({ example: '2026-08-15T10:00:00.000Z' })
  @IsDateString()
  date!: string;

  // Injected from JWT by the controller; not required in request body
  @ApiPropertyOptional({ example: 'f177fd76-df57-4e9d-a4dc-a0f438f22f0d' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}