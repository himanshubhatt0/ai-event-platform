import { configureStore } from '@reduxjs/toolkit';
import type { AppDispatch } from '@/redux/store';
import authReducer, { clearFeedback, loginUser, registerUser, logout } from '@/redux/slices/authSlice';
import { api } from '@/services/api';

// Mock the API
jest.mock('@/services/api');
const mockedApi = api as jest.Mocked<typeof api>;
type AuthSliceState = ReturnType<typeof authReducer>;

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const getAuthState = () => (store.getState() as { auth: AuthSliceState }).auth;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should handle successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      const mockToken = 'mock-jwt-token';

      // Mock API responses
      mockedApi.post.mockResolvedValueOnce({ data: { access_token: mockToken, message: 'Login successful' } });
      mockedApi.get.mockResolvedValueOnce({ data: mockUser });

      await (store.dispatch as AppDispatch)(loginUser({ email: 'test@example.com', password: 'password' }));

      const state = getAuthState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.success).toBe('Login successful');
    });

    it('should handle login failure with backend message', async () => {
      const errorMessage = 'Invalid email or password';
      mockedApi.post.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage, statusCode: 400 },
        },
      });

      await (store.dispatch as AppDispatch)(loginUser({ email: 'test@example.com', password: 'wrongpassword' }));

      const state = getAuthState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('registerUser', () => {
    it('should handle successful registration', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

      // Mock API response for registration
      mockedApi.post.mockResolvedValueOnce({
        data: { user: mockUser, message: 'Registration successful' },
      });

      await (store.dispatch as AppDispatch)(registerUser({ email: 'test@example.com', password: 'password', name: 'Test User' }));

      const state = getAuthState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.success).toBe('Registration successful');
    });

    it('should handle registration failure', async () => {
      const errorMessage = 'Email already exists';
      mockedApi.post.mockRejectedValueOnce(new Error(errorMessage));

      await (store.dispatch as AppDispatch)(registerUser({ email: 'existing@example.com', password: 'password', name: 'Test User' }));

      const state = getAuthState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearFeedback', () => {
    it('should clear success and error messages', () => {
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          access_token: 'token',
          user: { id: '1', email: 'test@example.com' },
          message: 'Login successful',
        },
      });

      store.dispatch({
        type: 'auth/register/rejected',
        payload: 'Registration failed',
      });

      store.dispatch(clearFeedback());

      const state = getAuthState();
      expect(state.error).toBe(null);
      expect(state.success).toBe(null);
    });
  });

  describe('logout', () => {
    it('should clear user data and token', () => {
      // Set initial state
      store.dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: { user: { id: '1', email: 'test@example.com' }, access_token: 'token' }
      });

      store.dispatch(logout());

      const state = getAuthState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
    });
  });
});