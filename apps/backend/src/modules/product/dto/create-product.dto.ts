import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';
import { PRODUCT_CONSTANTS } from '../product.constants';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: PRODUCT_CONSTANTS.ERRORS.TITLE_REQUIRED })
  @MaxLength(PRODUCT_CONSTANTS.VALIDATION.TITLE_MAX_LENGTH)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: PRODUCT_CONSTANTS.ERRORS.DESCRIPTION_REQUIRED })
  @MaxLength(PRODUCT_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH)
  description!: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsNotEmpty({ message: PRODUCT_CONSTANTS.ERRORS.INVALID_ORG_ID })
  organizationId!: string;
}