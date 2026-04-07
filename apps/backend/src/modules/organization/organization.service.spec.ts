import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  const mockPrisma = {
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      update: jest.fn(),
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

  it('should create organization', async () => {
    mockPrisma.organization.create.mockResolvedValue({
      id: 'org1',
      name: 'Test Org',
    });

    const result = await service.createOrg({ name: 'Test Org' });

    expect(result).toEqual({
      id: 'org1',
      name: 'Test Org',
    });
  });

  it('should assign user to organization', async () => {
    mockPrisma.user.update.mockResolvedValue({
      id: 'user1',
      organizationId: 'org1',
    });

    const result = await service.assignUser('org1', 'user1');

    expect(result.organizationId).toBe('org1');
  });

  it('should get organization users', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({
      id: 'org1',
      users: [{ id: 'user1' }],
    });

    const result = await service.getOrgUsers('org1');

    expect(result?.users.length).toBe(1);
  });
});