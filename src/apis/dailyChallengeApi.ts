import api from './authApi';
import type { TypoData, ReplayEvent } from './snippetResultApi';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  message?: string;
  timestamp: string;
}

export interface DailyChallengeSnippet {
  id: number;
  title: string;
  content: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playCount: number;
  avgWpm: number;
}

export interface DailyChallengeDto {
  id: number;
  date: string;
  snippet: DailyChallengeSnippet;
}

export interface SubmitDailyChallengeBody {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  typos?: TypoData[];
  replayData?: ReplayEvent[];
}

export type BestStatus = 'NEW_BEST' | 'NOT_BEST';
export type RankChangeStatus = 'FIRST_ATTEMPT' | 'UP' | 'DOWN' | 'SAME';
export type NearbyUserRelation = 'ME' | 'OTHER';

export interface NearbyUserItem {
  rank: number;
  userId: number;
  username: string;
  nWpm: number;
  relation: NearbyUserRelation;
}

export interface SubmitDailyChallengeResponseDto {
  resultId: number;
  nWpm: number;
  afterRank: number;
  beforeRank?: number;
  rankDelta?: number;
  rankChange: RankChangeStatus;
  bestStatus: BestStatus;
  nearbyUsers: NearbyUserItem[];
}

export type MyRankStatus = 'NOT_LOGGED_IN' | 'NOT_PARTICIPATED' | 'RANKED';

export interface LeaderboardItem {
  rank: number;
  userId: number;
  username: string;
  wpm: number;
  nWpm: number;
  accuracy: number;
  durationSec: number;
}

export interface ChallengeLeaderboardDto {
  date: string;
  snippetId: number;
  items: LeaderboardItem[];
  total: number;
  myRankStatus: MyRankStatus;
  myRank?: number;
}

export async function getDailyChallenge(): Promise<DailyChallengeDto> {
  const res = await api.get<ApiResponse<DailyChallengeDto>>('/api/daily-challenge');
  if (!res.data.data) throw new Error('No daily challenge');
  return res.data.data;
}

export async function submitDailyChallenge(body: SubmitDailyChallengeBody): Promise<SubmitDailyChallengeResponseDto> {
  const res = await api.post<ApiResponse<SubmitDailyChallengeResponseDto>>('/api/daily-challenge/submit', body);
  if (!res.data.data) throw new Error('Submit failed');
  return res.data.data;
}

export async function getDailyLeaderboard(): Promise<ChallengeLeaderboardDto> {
  const res = await api.get<ApiResponse<ChallengeLeaderboardDto>>('/api/daily-challenge/leaderboard');
  if (!res.data.data) throw new Error('No leaderboard');
  return res.data.data;
}
