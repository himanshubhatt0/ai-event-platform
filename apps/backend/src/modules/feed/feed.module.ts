import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { ProductModule } from '../product/product.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [FeedController],
  providers: [FeedService, ProductModule, PrismaService]
})
export class FeedModule {}
