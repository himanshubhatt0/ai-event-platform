import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  const mockPrisma = {
    $transaction: jest.fn(),
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create organization for user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      organizationId: null,
    });
    mockPrisma.organization.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (callback: any) =>
      callback({
        organization: {
          create: jest.fn().mockResolvedValue({ id: 'org1', name: 'Test Org' }),
        },
        user: {
          update: jest.fn().mockResolvedValue({
            id: 'user1',
            email: 'user@example.com',
            name: 'User',
            organizationId: 'org1',
          }),
        },
      }),
    );

    const result = await service.createOrgForUser('user1', { name: 'Test Org' });

    expect(result.organization.id).toBe('org1');
    expect(result.user.organizationId).toBe('org1');
  });

  it('should get organization details', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({
      id: 'org1',
      users: [],
      events: [],
      products: [],
    });

    const result = await service.getOrganization('org1');

    expect(result.id).toBe('org1');
  });

  it('should get organization events', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
    mockPrisma.event.findMany.mockResolvedValue([{ id: 'event1' }]);

    const result = await service.getOrgEvents('org1');

    expect(result).toHaveLength(1);
  });

  it('should get organization products', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
    mockPrisma.product.findMany.mockResolvedValue([{ id: 'prod1' }]);

    const result = await service.getOrgProducts('org1');

    expect(result).toHaveLength(1);
  });
});