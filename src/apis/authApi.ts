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

    // A: skipAuthRetry 플래그가 있으면 retry 없이 바로 reject
    if (original._skipAuthRetry) {
      return Promise.reject(error);
    }

    // B: 로그인 상태가 아니면 retry 하지 않음
    if (!useUserStore.getState().isLoggedIn) {
      return Promise.reject(error);
    }

    // refresh 엔드포인트 자체가 401이면 세션 종료
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
      // C: 이미 /login이면 리다이렉트 안 함
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
  // A: 로그인 여부 확인용 요청 — 실패해도 retry 불필요
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
