import api from './authApi';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  message?: string;
  timestamp: string;
}

export interface TypoData {
  index: number;
  expected: string;
  typed: string;
}

export interface ReplayEvent {
  index: number;
  char: string;
  timestamp: number;
  correct: boolean;
}

export interface SaveResultBody {
  snippetId: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  typos: TypoData[];
  replayData: ReplayEvent[];
}

export interface SnippetResultResponse {
  id: number;
  snippetId: number;
  userId: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  core: number;
  isNewBest: boolean;
  prevBestCore: number;
  createdAt: string;
}

export interface SnippetResultStats {
  id: number;
  snippetId: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  rank: number;
  wordStats: { bestWords: string[]; worstWords: string[] };
  wpmGraph: { second: number; wpm: number }[];
}

export interface RankingItem {
  rank: number;
  userId: number;
  username: string;
  profileUrl: string | null;
  core: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  createdAt: string;
}

export interface SnippetRankingResponse {
  items: RankingItem[];
  total: number;
  page: number;
  size: number;
}

export const saveSnippetResult = async (
  body: SaveResultBody,
): Promise<SnippetResultResponse | null> => {
  const { data } = await api.post<ApiResponse<SnippetResultResponse>>('/api/snippet-results', {
    ...body,
    replayData: body.replayData.slice(0, 5000),
    typos: body.typos.slice(0, 500),
  });
  return data.data;
};

export const getSnippetResultStats = async (
  resultId: number,
): Promise<SnippetResultStats> => {
  const { data } = await api.get<ApiResponse<SnippetResultStats>>(`/api/snippet-results/${resultId}`);
  return data.data!;
};

export const getSnippetReplay = async (resultId: number) => {
  const { data } = await api.get<ApiResponse<{ resultId: number; snippetId: number; replayData: ReplayEvent[] }>>(
    `/api/snippet-results/${resultId}/replay`,
  );
  return data.data!;
};

export const getSnippetRanking = async (
  snippetId: number,
  page = 1,
  size = 20,
): Promise<SnippetRankingResponse> => {
  const { data } = await api.get<ApiResponse<SnippetRankingResponse>>(
    `/api/snippets/${snippetId}/ranking?page=${page}&size=${size}`,
  );
  return data.data!;
};
