import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeed() {
    const events = await this.prisma.event.findMany();
    const products = await this.prisma.product.findMany();

    const feed = [
      ...events.map(e => ({ ...e, type: 'event' })),
      ...products.map(p => ({ ...p, type: 'product' })),
    ];

    return feed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
