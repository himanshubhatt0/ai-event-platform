import { api } from './api';
import { AuthResponse, User } from '@/types/auth';

export const loginApi = async (
  email: string,
  password: string
): Promise<{ access_token: string; message: string }> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (
  email: string,
  password: string,
  name: string
): Promise<{ message: string; user: User }> => {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
};

export const getMeApi = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data;
};