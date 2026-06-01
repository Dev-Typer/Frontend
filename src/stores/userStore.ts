import { create } from 'zustand';

export type UserRole = 'USER' | 'ADMIN';

interface UserState {
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  isLoggedIn: boolean;
  setUser: (userId: number, username: string, role: UserRole) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  role: null,
  isLoggedIn: false,
  setUser: (userId, username, role) => set({ userId, username, role, isLoggedIn: true }),
  clearUser: () => set({ userId: null, username: null, role: null, isLoggedIn: false }),
}));
