import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ProductService', () => {
  let service: ProductService;

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
    },
    product: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create product', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });

    mockPrisma.product.create.mockResolvedValue({
      id: 'prod1',
      title: 'Test Product',
    });

    const result = await service.createProduct({
      title: 'Test Product',
      description: 'Desc',
      price: 100,
      organizationId: 'org1',
    });

    expect(result.id).toBe('prod1');
  });

  it('should throw if org not found', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue(null);

    await expect(
      service.createProduct({
        title: 'Test',
        description: 'Desc',
        price: 100,
        organizationId: 'org1',
      }),
    ).rejects.toThrow('Organization not found');
  });
});
