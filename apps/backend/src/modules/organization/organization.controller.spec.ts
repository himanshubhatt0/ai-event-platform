import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  const mockService = {
    createOrg: jest.fn(),
    assignUser: jest.fn(),
    getOrgUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        { provide: OrganizationService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should create organization', async () => {
    mockService.createOrg.mockResolvedValue({ id: 'org1' });

    const result = await controller.create({ name: 'Test Org' });

    expect(result.id).toBe('org1');
  });

  it('should assign user', async () => {
    mockService.assignUser.mockResolvedValue({
      id: 'user1',
      organizationId: 'org1',
    });

    const result = await controller.assignUser('org1', 'user1');

    expect(result.organizationId).toBe('org1');
  });

  it('should get users', async () => {
    mockService.getOrgUsers.mockResolvedValue({
      users: [{ id: 'user1' }],
    });

    const result = await controller.getUsers('org1');

    expect(result?.users.length).toBe(1);
  });
});
