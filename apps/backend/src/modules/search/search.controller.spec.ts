import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;

  const mockService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: SearchService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should return results', async () => {
    mockService.search.mockResolvedValue([{ id: '1' }]);

    const result = await controller.search('test', { user: { id: 'u1' } } as any);

    expect(result.length).toBe(1);
  });
});
