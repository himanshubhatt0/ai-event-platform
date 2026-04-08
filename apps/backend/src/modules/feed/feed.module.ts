import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { ProductModule } from '../product/product.module';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [ProductModule],
  controllers: [FeedController],
  providers: [FeedService, PrismaService]
})
export class FeedModule {}
