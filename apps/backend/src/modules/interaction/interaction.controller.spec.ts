import { Test, TestingModule } from '@nestjs/testing';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';

describe('InteractionController', () => {
  let controller: InteractionController;

  const mockService = {
    interact: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionController],
      providers: [
        { provide: InteractionService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<InteractionController>(InteractionController);
  });

  it('should call interact', async () => {
    mockService.interact.mockResolvedValue({ toggledOn: true, interaction: { id: '1' } });

    const result = await controller.interact({
      userId: 'u1',
      type: 'LIKE',
      eventId: 'e1',
    } as any, { user: { id: 'u1' } } as any);

    expect(result.interaction.id).toBe('1');
  });
});
