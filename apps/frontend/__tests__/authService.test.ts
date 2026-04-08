import { loginApi, registerApi, getMeApi } from '@/services/auth.service';
import { api } from '@/services/api';

// Mock the API
jest.mock('@/services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginApi', () => {
    it('should call login endpoint with correct data', async () => {
      const mockResponse = { access_token: 'mock-token' };
      mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await loginApi('test@example.com', 'password');

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on login failure', async () => {
      const error = new Error('Invalid credentials');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(loginApi('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('registerApi', () => {
    it('should call register endpoint with correct data', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockedApi.post.mockResolvedValueOnce({ data: mockUser });

      const result = await registerApi('test@example.com', 'password', 'Test User');

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error on registration failure', async () => {
      const error = new Error('Email already exists');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(registerApi('existing@example.com', 'password', 'Test User')).rejects.toThrow('Email already exists');
    });
  });

  describe('getMeApi', () => {
    it('should call me endpoint', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockedApi.get.mockResolvedValueOnce({ data: mockUser });

      const result = await getMeApi();

      expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when not authenticated', async () => {
      const error = new Error('Unauthorized');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getMeApi()).rejects.toThrow('Unauthorized');
    });
  });
});