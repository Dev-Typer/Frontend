import api from './authApi';

export type SnippetLanguage = 'JavaScript' | 'TypeScript' | 'Python' | 'Java' | 'Go' | 'C++' | 'C#' | 'C' | 'Rust' | 'Kotlin';
export type SnippetDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SnippetSort = 'newest' | 'oldest' | 'most-liked' | 'least-liked';
export type PlayedByMe = 'played' | 'not-played';

export interface Snippet {
  id: number;
  title: string;
  language: SnippetLanguage;
  difficulty: SnippetDifficulty;
  content: string;
  source: string | null;
  avgWpm: number;
  playCount: number;
  likeCount: number;
  isLiked: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SnippetPage {
  data: Snippet[];
  total: number;
  page: number;
  size: number;
}

export interface SnippetListParams {
  language?: SnippetLanguage;
  difficulty?: SnippetDifficulty;
  keyword?: string;
  sort?: SnippetSort;
  likedByMe?: boolean;
  playedByMe?: PlayedByMe;
  page?: number;
  size?: number;
}

export interface SnippetLikeResponse {
  likeCount: number;
  isLiked: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// ─── 유저용 (공개 API) ────────────────────────────────────────────────────────

export const getPublicSnippets = async (params?: SnippetListParams): Promise<SnippetPage> => {
  const { data } = await api.get<ApiResponse<SnippetPage>>('/api/snippets', { params });
  return data.data;
};

export const getPublicSnippet = async (id: number): Promise<Snippet> => {
  const { data } = await api.get<ApiResponse<Snippet>>(`/api/snippets/${id}`);
  return data.data;
};

export const getRandomSnippet = async (
  language?: SnippetLanguage,
  difficulty?: SnippetDifficulty,
): Promise<Snippet> => {
  const { data } = await api.get<ApiResponse<Snippet>>('/api/snippets/random', {
    params: { language, difficulty },
  });
  return data.data;
};

export const likeSnippet = async (id: number): Promise<SnippetLikeResponse> => {
  const { data } = await api.post<ApiResponse<SnippetLikeResponse>>(`/api/snippets/${id}/like`);
  return data.data;
};

export const unlikeSnippet = async (id: number): Promise<SnippetLikeResponse> => {
  const { data } = await api.delete<ApiResponse<SnippetLikeResponse>>(`/api/snippets/${id}/like`);
  return data.data;
};

// ─── 어드민용 ──────────────────────────────────────────────────────────────────

export interface CreateSnippetBody {
  title: string;
  language: SnippetLanguage;
  difficulty: SnippetDifficulty;
  content: string;
  source?: string;
}

export type UpdateSnippetBody = Partial<CreateSnippetBody & { isActive: boolean }>;

export interface AdminSnippetPage {
  data: Snippet[];
  total: number;
  page: number;
  size: number;
}

export const getAdminSnippets = async (params?: {
  language?: SnippetLanguage;
  difficulty?: SnippetDifficulty;
  isActive?: boolean;
  page?: number;
  size?: number;
}): Promise<AdminSnippetPage> => {
  const { data } = await api.get<ApiResponse<AdminSnippetPage>>('/api/admin/snippets', { params });
  return data.data;
};

export const getAdminSnippet = async (id: number): Promise<Snippet> => {
  const { data } = await api.get<ApiResponse<Snippet>>(`/api/admin/snippets/${id}`);
  return data.data;
};

export const createSnippet = async (body: CreateSnippetBody): Promise<Snippet> => {
  const { data } = await api.post<ApiResponse<Snippet>>('/api/admin/snippets', body);
  return data.data;
};

export const updateSnippet = async (id: number, body: UpdateSnippetBody): Promise<Snippet> => {
  const { data } = await api.patch<ApiResponse<Snippet>>(`/api/admin/snippets/${id}`, body);
  return data.data;
};

export const deactivateSnippet = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/snippets/${id}`);
};
