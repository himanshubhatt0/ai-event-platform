import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockPrisma = {
    event: { findMany: jest.fn() },
    product: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should return search results', async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
    mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1' }]);

    const result = await service.search('test');

    expect(result.length).toBe(2);
  });

  it('should throw if empty query', async () => {
    await expect(service.search('')).rejects.toThrow();
  });
});
