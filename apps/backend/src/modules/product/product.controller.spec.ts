import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;

  const mockService = {
    createProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create product', async () => {
    mockService.createProduct.mockResolvedValue({ id: 'prod1' });

    const result = await controller.create(
      { user: { organizationId: 'org1' } } as any,
      {
        title: 'Test',
        description: 'Desc',
        price: 100,
        organizationId: 'org1',
      },
    );

    expect(result.id).toBe('prod1');
  });
});
