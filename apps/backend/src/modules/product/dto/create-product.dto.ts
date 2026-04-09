import { IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_CONSTANTS } from '../product.constants';

export class CreateProductDto {
  @ApiProperty({ example: 'Pro Networking Pass' })
  @IsString()
  @IsNotEmpty({ message: PRODUCT_CONSTANTS.ERRORS.TITLE_REQUIRED })
  @MaxLength(PRODUCT_CONSTANTS.VALIDATION.TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({ example: 'Access to closed networking sessions and mentor office hours.' })
  @IsString()
  @IsNotEmpty({ message: PRODUCT_CONSTANTS.ERRORS.DESCRIPTION_REQUIRED })
  @MaxLength(PRODUCT_CONSTANTS.VALIDATION.DESCRIPTION_MAX_LENGTH)
  description!: string;

  @ApiProperty({ example: 199.99, type: Number })
  @IsNumber()
  price!: number;

  // Injected from JWT by the controller; not required in request body
  @ApiPropertyOptional({ example: 'f177fd76-df57-4e9d-a4dc-a0f438f22f0d' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}