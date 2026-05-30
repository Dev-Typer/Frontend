import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

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

// 동시에 여러 요청이 401 날 때 refresh를 한 번만 호출하기 위한 큐
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // refresh 엔드포인트 자체가 실패하면 로그인 페이지로
    if (error.response?.status === 401 && original.url?.includes('/api/auth/refresh')) {
      useUserStore.getState().clearUser();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
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
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<ApiResponse<MeResponse>>('/api/auth/me');
  return data.data!;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const refreshToken = async (): Promise<void> => {
  await api.post('/api/auth/refresh');
};

export default api;
