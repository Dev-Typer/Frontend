import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/stores/userStore';

interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRetry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  paramsSerializer: { indexes: null },
});

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface MeResponse {
  userId: number;
  username: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfigWithRetry;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // A: _skipAuthRetry flag set — reject immediately without retry
    if (original._skipAuthRetry) {
      return Promise.reject(error);
    }

    // B: not logged in — skip retry
    if (!useUserStore.getState().isLoggedIn) {
      return Promise.reject(error);
    }

    // refresh endpoint returned 401 — session is gone, clear and redirect
    if (original.url?.includes('/api/auth/refresh')) {
      useUserStore.getState().clearUser();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: () => resolve(api(original)), reject });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post('/api/auth/refresh');
      processQueue(null);
      return api(original);
    } catch (err) {
      processQueue(err);
      useUserStore.getState().clearUser();
      // C: skip redirect if already on /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<ApiResponse<MeResponse>>('/api/auth/me', {
    _skipAuthRetry: true,
  } as AxiosRequestConfigWithRetry);
  return data.data!;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const refreshToken = async (): Promise<void> => {
  await api.post('/api/auth/refresh');
};

export default api;
