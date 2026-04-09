import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { AuthService } from '../auth/auth.service';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  const mockService = {
    createOrgForUser: jest.fn(),
    getOrganization: jest.fn(),
    getOrgEvents: jest.fn(),
    getOrgProducts: jest.fn(),
  };

  const mockAuthService = {
    createAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        { provide: OrganizationService, useValue: mockService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create organization for current user', async () => {
    mockService.createOrgForUser.mockResolvedValue({
      organization: { id: 'org1', name: 'Test Org' },
      user: {
        id: 'user1',
        email: 'user@example.com',
        name: 'User',
        organizationId: 'org1',
      },
    });
    mockAuthService.createAccessToken.mockReturnValue('token-123');

    const result = await controller.createMine(
      { name: 'Test Org' },
      { user: { id: 'user1' } } as any,
    );

    expect(mockService.createOrgForUser).toHaveBeenCalledWith('user1', {
      name: 'Test Org',
    });
    expect(result.access_token).toBe('token-123');
    expect(result.organization.id).toBe('org1');
  });

  it('should get organization details', async () => {
    mockService.getOrganization.mockResolvedValue({ id: 'org1' });

    const result = await controller.getOrganization('org1');

    expect(result.id).toBe('org1');
  });

  it('should get organization events', async () => {
    mockService.getOrgEvents.mockResolvedValue([{ id: 'event1' }]);

    const result = await controller.getEvents('org1');

    expect(result).toHaveLength(1);
  });

  it('should get organization products', async () => {
    mockService.getOrgProducts.mockResolvedValue([{ id: 'prod1' }]);

    const result = await controller.getProducts('org1');

    expect(result).toHaveLength(1);
  });
});
