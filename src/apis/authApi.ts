import axios from 'axios';

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
