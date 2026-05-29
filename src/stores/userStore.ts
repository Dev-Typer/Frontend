import { create } from 'zustand';

interface UserState {
  userId: number | null;
  username: string | null;
  isLoggedIn: boolean;
  setUser: (userId: number, username: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  isLoggedIn: false,
  setUser: (userId, username) => set({ userId, username, isLoggedIn: true }),
  clearUser: () => set({ userId: null, username: null, isLoggedIn: false }),
}));
