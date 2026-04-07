import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call register', async () => {
    mockAuthService.register.mockResolvedValue({ id: '1' });

    const result = await controller.register({
      email: 'test@test.com',
      password: '123456',
      name: 'Test',
    });

    expect(result).toEqual({ id: '1' });
  });

  it('should call login', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'token',
    });

    const result = await controller.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.access_token).toBe('token');
  });
});
