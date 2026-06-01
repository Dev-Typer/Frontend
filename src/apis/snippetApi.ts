import api from './authApi';

export type SnippetLanguage = 'JAVASCRIPT' | 'PYTHON' | 'JAVA' | 'CPP';
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

export interface SnippetPage {
  items: Snippet[];
  total: number;
  page: number;
  limit: number;
}

export interface SnippetQuery {
  language?: SnippetLanguage;
  difficulty?: SnippetDifficulty;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateSnippetBody {
  title: string;
  language: SnippetLanguage;
  difficulty: SnippetDifficulty;
  content: string;
  source?: string;
}

export type UpdateSnippetBody = Partial<CreateSnippetBody>;

interface ApiResponse<T> {
  data: T;
}

export const getSnippets = async (query: SnippetQuery = {}): Promise<SnippetPage> => {
  const { data } = await api.get<ApiResponse<SnippetPage>>('/api/admin/snippets', { params: query });
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
