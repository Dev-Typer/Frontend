import api from './authApi';
import type {
  UserStreakResponse,
  UserWpmHistoryResponse,
  UserCoreResponse,
  UserCoreByLangResponse,
  UserCoreHistoryResponse,
} from '@/types';

export interface UserMeResponse {
  username: string;
  profileUrl: string | null;
  bannerUrl: string | null;
  totalCore: number;
  currentStreak: number;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  message?: string;
  timestamp: string;
}

export const getUserMe = async (): Promise<UserMeResponse> => {
  const { data } = await api.get<ApiResponse<UserMeResponse>>('/api/user/me');
  return data.data!;
};

export const getUserStreak = async (year?: number, type?: string): Promise<UserStreakResponse> => {
  const { data } = await api.get<ApiResponse<UserStreakResponse>>('/api/user/me/streak', {
    params: { year, type },
  });
  return data.data!;
};

export const getCurrentStreak = async (): Promise<{ currentStreak: number }> => {
  const { data } = await api.get<ApiResponse<{ currentStreak: number }>>('/api/user/me/current-streak');
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

// ─── 공개 프로필 (username 기준) ──────────────────────────────────────────────

export const getPublicUserProfile = async (username: string): Promise<UserMeResponse> => {
  const { data } = await api.get<ApiResponse<UserMeResponse>>(`/api/user/${username}`);
  return data.data!;
};

export const getPublicUserStreak = async (username: string, year?: number, type?: string): Promise<UserStreakResponse> => {
  const { data } = await api.get<ApiResponse<UserStreakResponse>>(`/api/user/${username}/streak`, {
    params: { year, type },
  });
  return data.data!;
};

export const getPublicUserWpmHistory = async (username: string): Promise<UserWpmHistoryResponse> => {
  const { data } = await api.get<ApiResponse<UserWpmHistoryResponse>>(`/api/user/${username}/wpm/history`);
  return data.data!;
};

export const getPublicUserCore = async (username: string): Promise<UserCoreResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreResponse>>(`/api/user/${username}/core`);
  return data.data!;
};

export const getPublicUserCoreByLanguage = async (username: string): Promise<UserCoreByLangResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreByLangResponse>>(`/api/user/${username}/core/by-language`);
  return data.data!;
};

export const getPublicUserCoreHistory = async (username: string): Promise<UserCoreHistoryResponse> => {
  const { data } = await api.get<ApiResponse<UserCoreHistoryResponse>>(`/api/user/${username}/core/history`);
  return data.data!;
};

// ─── 호버 카드 ────────────────────────────────────────────────────────────────

export interface UserHoverResponse {
  username:      string;
  profileUrl:    string | null;
  bannerUrl:     string | null;
  totalCore:     number;
  avgWpm:        number;
  currentStreak: number;
  globalRank:    number;
}

export const getUserHoverCard = async (username: string): Promise<UserHoverResponse> => {
  const { data } = await api.get<ApiResponse<UserHoverResponse>>(`/api/user/${username}/hover`);
  return data.data!;
};
