import { Test, TestingModule } from '@nestjs/testing';
import { InteractionService } from './interaction.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('InteractionService', () => {
  let service: InteractionService;

  const mockPrisma = {
    interaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InteractionService>(InteractionService);
  });

  it('should create interaction', async () => {
    mockPrisma.interaction.findFirst.mockResolvedValue(null);
    mockPrisma.interaction.create.mockResolvedValue({ id: '1' });

    const result = await service.interact({
      userId: 'u1',
      type: 'LIKE',
      eventId: 'e1',
    } as any);

    expect(result.id).toBe('1');
  });

  it('should toggle interaction', async () => {
    mockPrisma.interaction.findFirst.mockResolvedValue({ id: '1' });
    mockPrisma.interaction.delete.mockResolvedValue({});

    const result = await service.interact({
      userId: 'u1',
      type: 'LIKE',
      eventId: 'e1',
    } as any);

    expect(result.id).toBe('1');
  });
});
