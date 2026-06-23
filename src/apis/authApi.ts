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
  role: 'USER' | 'ADMIN';
  profileUrl: string | null;
  bannerUrl: string | null;
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

    // A: skipAuthRetry ?뚮옒洹멸? ?덉쑝硫?retry ?놁씠 諛붾줈 reject
    if (original._skipAuthRetry) {
      return Promise.reject(error);
    }

    // B: 濡쒓렇???곹깭媛 ?꾨땲硫?retry ?섏? ?딆쓬
    if (!useUserStore.getState().isLoggedIn) {
      return Promise.reject(error);
    }

    // refresh ?붾뱶?ъ씤???먯껜媛 401?대㈃ ?몄뀡 醫낅즺
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
      // C: ?대? /login?대㈃ 由щ떎?대젆??????
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
  const { data } = await api.get<ApiResponse<MeResponse>>('/api/user/me', {
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
