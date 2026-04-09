import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('EventService', () => {
  let service: EventService;

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
    },
    event: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should create event', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });

    mockPrisma.event.create.mockResolvedValue({ id: 'event1' });

    const result = await service.createEvent({
      title: 'Test',
      description: 'Desc',
      date: new Date().toISOString(),
      organizationId: 'org1',
    });

    expect(result.id).toBe('event1');
  });
});
