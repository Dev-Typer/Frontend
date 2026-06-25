import api from './authApi';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  message?: string;
  timestamp: string;
}

export interface SoloLeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  profileUrl: string | null;
  totalCore: number;
  avgWpm: number;
  playCount: number;
  snippetCount: number;
  avgAccuracy: number;
  isMe: boolean;
}

export interface SoloLeaderboardResponse {
  entries: SoloLeaderboardEntry[];
  myRank: number | null;
  totalCount: number;
  page: number;
  size: number;
}

export interface StreakLeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  profileUrl: string | null;
  currentStreak: number;
  isMe: boolean;
}

export interface StreakLeaderboardResponse {
  entries: StreakLeaderboardEntry[];
  myRank: number | null;
  totalCount: number;
  page: number;
  size: number;
}

export const getSoloLeaderboard = async (
  page = 1,
  size = 50,
  language?: string,
): Promise<SoloLeaderboardResponse> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (language) params.set('language', language);
  const { data } = await api.get<ApiResponse<SoloLeaderboardResponse>>(
    `/api/leaderboard/solo?${params}`,
  );
  return data.data!;
};

export const getStreakLeaderboard = async (
  page = 1,
  size = 50,
): Promise<StreakLeaderboardResponse> => {
  const { data } = await api.get<ApiResponse<StreakLeaderboardResponse>>(
    `/api/leaderboard/streak?page=${page}&size=${size}`,
  );
  return data.data!;
};
