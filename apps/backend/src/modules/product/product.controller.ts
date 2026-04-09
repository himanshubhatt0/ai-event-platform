import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgGuard } from '../auth/org.guard';

@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

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