import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productService.createProduct(body);
  }

  @Get()
  getAll(@Query('organizationId') organizationId?: string) {
    if (organizationId) {
      return this.productService.getProductsByOrganization(organizationId);
    }
    return this.productService.getProducts();
  }

  @Get(':productId')
  getById(@Param('productId', new ParseUUIDPipe()) productId: string) {
    return this.productService.getProductById(productId);
  }

  @Put(':productId')
  update(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() body: Partial<CreateProductDto>,
  ) {
    return this.productService.updateProduct(productId, body);
  }
}