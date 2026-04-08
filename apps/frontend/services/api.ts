import axios from 'axios';
import { getCookie } from '@/utils/cookies';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// ✅ attach token automatically from cookie or local storage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getCookie('auth_token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});