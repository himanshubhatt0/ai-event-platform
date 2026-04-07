import { IsNotEmpty, IsString, MaxLength, IsDateString } from 'class-validator';
import { EVENT_CONSTANTS } from '../event.constants';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: EVENT_CONSTANTS.ERRORS.TITLE_REQUIRED })
  @MaxLength(EVENT_CONSTANTS.VALIDATION.TITLE_MAX_LENGTH)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: EVENT_CONSTANTS.ERRORS.DESCRIPTION_REQUIRED })
  @MaxLength(EVENT_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH)
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty({ message: EVENT_CONSTANTS.ERRORS.INVALID_ORG_ID })
  organizationId!: string;
}