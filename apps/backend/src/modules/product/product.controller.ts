import { Body, Controller, Get, Post } from '@nestjs/common';
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
  getAll() {
    return this.productService.getProducts();
  }
}