import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;

  const mockService = {
    createEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: mockService }],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should create event', async () => {
    mockService.createEvent.mockResolvedValue({ id: 'event1' });

    const result = await controller.create(
      { user: { organizationId: 'org1' } } as any,
      {
        title: 'Test',
        description: 'Desc',
        date: new Date().toISOString(),
        organizationId: 'org1',
      },
    );

    expect(result.id).toBe('event1');
  });
});
