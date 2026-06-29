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

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = api
    .post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh')
    .then((res) => {
      const token = res.data.data!.accessToken;
      useUserStore.getState().setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfigWithRetry;

    if (error.response?.status !== 401) return Promise.reject(error);

    if (original._skipAuthRetry) return Promise.reject(error);

    if (!useUserStore.getState().isLoggedIn) return Promise.reject(error);

    if (original.url?.includes('/api/auth/refresh')) {
      useUserStore.getState().clearUser();
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (original._retry) return Promise.reject(error);
    original._retry = true;

    try {
      await doRefresh();
      return api(original);
    } catch (err) {
      useUserStore.getState().clearUser();
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(err);
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

export const exchangeCode = async (code: string): Promise<{ accessToken: string }> => {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
    '/api/auth/token-exchange',
    { code },
  );
  return data.data!;
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh');
  return data.data!;
};

export default api;
