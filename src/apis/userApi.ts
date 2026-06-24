import api from './authApi';
import type {
  UserStreakResponse,
  UserWpmHistoryResponse,
  UserCoreResponse,
  UserCoreByLangResponse,
  UserCoreHistoryResponse,
} from '@/types';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  message?: string;
  timestamp: string;
}

export const getUserStreak = async (year?: number, type?: string): Promise<UserStreakResponse> => {
  const { data } = await api.get<ApiResponse<UserStreakResponse>>('/api/user/me/streak', {
    params: { year, type },
  });
  return data.data!;
};

export const getUserWpmHistory = async (): Promise<UserWpmHistoryResponse> => {
  const { data } = await api.get<ApiResponse<UserWpmHistoryResponse>>('/api/user/me/wpm/history');
  return data.data!;
};

export const getUserCore = async (): Promise<UserCoreResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreResponse>>('/api/user/me/core');
  return data.data!;
};

export const getUserCoreByLanguage = async (): Promise<UserCoreByLangResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreByLangResponse>>('/api/user/me/core/by-language');
  return data.data!;
};

export const getUserCoreHistory = async (): Promise<UserCoreHistoryResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreHistoryResponse>>('/api/user/me/core/history');
  return data.data!;
};

export const uploadProfileImage = async (file: File): Promise<{ profileUrl: string }> => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ApiResponse<{ profileUrl: string }>>('/api/user/me/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data!;
};

export const deleteProfileImage = async (): Promise<void> => {
  await api.delete('/api/user/me/profile');
};

export const uploadBannerImage = async (file: File): Promise<{ bannerUrl: string }> => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ApiResponse<{ bannerUrl: string }>>('/api/user/me/banner', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data!;
};

export const deleteBannerImage = async (): Promise<void> => {
  await api.delete('/api/user/me/banner');
};
