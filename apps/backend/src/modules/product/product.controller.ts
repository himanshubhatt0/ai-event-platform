import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgGuard } from '../auth/org.guard';

@ApiTags('Product')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @ApiOperation({ summary: 'Create a product for the authenticated organization' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ description: 'Product created successfully.' })
  @ApiBadRequestResponse({ description: 'Validation failed for request body.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @Post()
  @UseGuards(OrgGuard)
  create(@Request() req, @Body() body: CreateProductDto) {
    // organizationId always comes from JWT — body value is ignored
    return this.productService.createProduct({
      ...body,
      organizationId: req.user.organizationId,
    });
  }
}