import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InteractionType } from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  private buildInteractionData(
    interactions: Array<{ type: InteractionType; userId: string }>,
    userId: string,
  ) {
    const interactionCounts = {
      LIKE: 0,
      SAVE: 0,
      REGISTER: 0,
    };

    const userInteractionsSet = new Set<InteractionType>();

    for (const interaction of interactions) {
      interactionCounts[interaction.type] += 1;
      if (interaction.userId === userId) {
        userInteractionsSet.add(interaction.type);
      }
    }

    return {
      interactionCounts,
      userInteractions: Array.from(userInteractionsSet),
    };
  }

  async getFeed(userId: string) {
    const events = await this.prisma.event.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        interactions: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
    });

    const products = await this.prisma.product.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        interactions: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
    });

    const feed = [
      ...events.map((event) => {
        const { interactions, ...rest } = event;
        return {
          ...rest,
          type: 'event',
          ...this.buildInteractionData(interactions, userId),
        };
      }),
      ...products.map((product) => {
        const { interactions, ...rest } = product;
        return {
          ...rest,
          type: 'product',
          ...this.buildInteractionData(interactions, userId),
        };
      }),
    ];

    return feed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
