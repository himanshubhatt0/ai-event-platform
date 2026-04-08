import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
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
  @UseGuards(OrgGuard)
  update(
    @Request() req,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() body: Partial<CreateProductDto>,
  ) {
    return this.productService.updateProduct(productId, body, req.user.organizationId);
  }

  @Delete(':productId')
  @UseGuards(OrgGuard)
  delete(
    @Request() req,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.productService.deleteProduct(productId, req.user.organizationId);
  }
}