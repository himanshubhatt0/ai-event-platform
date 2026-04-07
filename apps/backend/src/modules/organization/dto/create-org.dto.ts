import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ORGANIZATION_CONSTANTS } from '../organization.constants';

export class CreateOrgDto {
  @IsString()
  @IsNotEmpty({ message: ORGANIZATION_CONSTANTS.ERRORS.NAME_REQUIRED })
  @MaxLength(ORGANIZATION_CONSTANTS.VALIDATION.ORG_NAME_MAX_LENGTH, {
    message: ORGANIZATION_CONSTANTS.ERRORS.NAME_TOO_LONG,
  })
  name!: string;
}