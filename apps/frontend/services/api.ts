import axios from 'axios';
import { getCookie } from '@/utils/cookies';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach token automatically from auth cookie.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getCookie('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});