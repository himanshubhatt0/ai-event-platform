import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../../prisma/prisma.service';
import * as aiService from 'src/common/utils/ai.service';
import * as pineconeService from 'src/common/utils/pinecone.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrisma = {
    event: { findMany: jest.fn() },
    product: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.spyOn(aiService, 'getEmbedding').mockResolvedValue([0.1, 0.2, 0.3]);
    jest.spyOn(pineconeService.index, 'query').mockResolvedValue({
      namespace: '',
      matches: [
        { id: 'e1', metadata: { type: 'event' }, score: 0.8 },
        { id: 'p1', metadata: { type: 'product' }, score: 0.9 },
      ],
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should return search results', async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        title: 'Event 1',
        description: 'Desc',
        createdAt: new Date().toISOString(),
        organizationId: 'org1',
        organization: { id: 'org1', name: 'Org 1' },
        interactions: [],
      },
    ]);
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: 'p1',
        title: 'Product 1',
        description: 'Desc',
        price: 100,
        createdAt: new Date().toISOString(),
        organizationId: 'org1',
        organization: { id: 'org1', name: 'Org 1' },
        interactions: [],
      },
    ]);

    const result = await service.search('test', 'u1');

    expect(pineconeService.index.query).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  it('should throw if empty query', async () => {
    await expect(service.search('', 'u1')).rejects.toThrow();
  });
});
