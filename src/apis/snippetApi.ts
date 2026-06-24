import api from './authApi';

export type SnippetLanguage = 'JavaScript' | 'TypeScript' | 'Python' | 'Java' | 'Go' | 'C++' | 'C#' | 'C' | 'Rust' | 'Kotlin';
export type SnippetDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Snippet {
  id: number;
  title: string;
  language: SnippetLanguage;
  difficulty: SnippetDifficulty;
  content: string;
  source: string | null;
  avgWpm: number;
  playCount: number;
  isDaily: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// ─── 유저용 ───────────────────────────────────────────────────────────────────

export const getRandomSnippet = async (
  language?: SnippetLanguage,
  difficulty?: SnippetDifficulty,
): Promise<Snippet> => {
  const { data } = await api.get<ApiResponse<Snippet>>('/api/snippets/random', {
    params: { language, difficulty },
  });
  return data.data;
};

export const getDailySnippet = async (): Promise<Snippet> => {
  const { data } = await api.get<ApiResponse<Snippet>>('/api/snippets/daily');
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

export type UpdateSnippetBody = Partial<CreateSnippetBody & { isDaily: boolean }>;

export interface SnippetPage {
  data: Snippet[];
  total: number;
  page: number;
  size: number;
}

export const getSnippets = async (params?: {
  language?: SnippetLanguage;
  difficulty?: SnippetDifficulty;
  isActive?: boolean;
  page?: number;
  size?: number;
}): Promise<SnippetPage> => {
  const { data } = await api.get<ApiResponse<SnippetPage>>('/api/admin/snippets', { params });
  return data.data;
};

export const getSnippet = async (id: number): Promise<Snippet> => {
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
