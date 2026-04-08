import { api } from './api';

export type FeedItemType = 'event' | 'product';
export type InteractionType = 'LIKE' | 'SAVE' | 'REGISTER';

export interface InteractionCounts {
  LIKE: number;
  SAVE: number;
  REGISTER: number;
}

export interface MarketplaceItem {
  id: string;
  type: FeedItemType;
  title: string;
  description: string;
  createdAt: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
  interactionCounts: InteractionCounts;
  userInteractions: InteractionType[];
  relevanceScore?: number;
  location?: string;
  date?: string;
  price?: number;
}

interface ToggleInteractionResponse {
  toggledOn: boolean;
  interaction: {
    id: string;
    type: InteractionType;
    eventId?: string;
    productId?: string;
    userId: string;
    createdAt: string;
  };
}

export const marketplaceService = {
  async getFeed(): Promise<MarketplaceItem[]> {
    const response = await api.get('/feed');
    return response.data;
  },

  async search(query: string): Promise<MarketplaceItem[]> {
    const response = await api.get('/search', {
      params: { q: query },
    });
    return response.data;
  },

  async toggleInteraction(payload: {
    type: InteractionType;
    eventId?: string;
    productId?: string;
  }): Promise<ToggleInteractionResponse> {
    const response = await api.post('/interaction', payload);
    return response.data;
  },
};
