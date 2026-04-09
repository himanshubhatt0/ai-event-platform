import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register user', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
    });

    const result = await service.register({
      email: 'test@test.com',
      password: '123456',
      name: 'Test',
    });

    expect(result).toEqual({
      message: 'User registered successfully',
      user: {
        id: '1',
        email: 'test@test.com',
        name: 'Test',
      },
    });
  });

  it('should login user', async () => {
    const hashed = await bcrypt.hash('123456', 10);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: hashed,
    });

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.access_token).toBe('test-token');
  });
});
