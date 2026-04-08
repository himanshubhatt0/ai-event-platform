import { api } from './api';
import { AuthResponse } from '@/types/auth';

export const loginApi = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { email, password });
  return res.data;
};