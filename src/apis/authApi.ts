import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export interface MeResponse {
  userId: number;
  username: string;
}

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<MeResponse>('/api/auth/me');
  return data;
};

export default api;
