import { create } from 'zustand';
import type { MeResponse } from '@/apis/authApi';
import type { UserMeResponse } from '@/apis/userApi';

export type UserRole = 'USER' | 'ADMIN';

interface UserState {
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  profileUrl: string | null;
  bannerUrl: string | null;
  createdAt: string | null;
  totalCore: number;
  currentStreak: number;
  isLoggedIn: boolean;
  accessToken: string | null;
  isInitializing: boolean;
  setUser: (data: MeResponse) => void;
  setUserMe: (data: UserMeResponse) => void;
  setCurrentStreak: (n: number) => void;
  setProfileUrl: (url: string | null) => void;
  setBannerUrl: (url: string | null) => void;
  setAccessToken: (token: string) => void;
  setInitializing: (v: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  role: null,
  profileUrl: null,
  bannerUrl: null,
  createdAt: null,
  totalCore: 0,
  currentStreak: 0,
  isLoggedIn: false,
  accessToken: null,
  isInitializing: true,
  setAccessToken: (token) => set({ accessToken: token }),
  setInitializing: (v) => set({ isInitializing: v }),
  setUser: (data) => set({
    userId: data.userId,
    username: data.username,
    role: data.role,
    createdAt: data.createdAt,
    isLoggedIn: true,
  }),
  setUserMe: (data) => set({
    username: data.username,
    profileUrl: data.profileUrl,
    bannerUrl: data.bannerUrl,
    totalCore: data.totalCore,
    currentStreak: data.currentStreak,
  }),
  setCurrentStreak: (n) => set({ currentStreak: n }),
  setProfileUrl: (profileUrl) => set({ profileUrl }),
  setBannerUrl: (bannerUrl) => set({ bannerUrl }),
  clearUser: () => set({
    userId: null, username: null, role: null,
    profileUrl: null, bannerUrl: null, createdAt: null,
    totalCore: 0, currentStreak: 0,
    isLoggedIn: false, accessToken: null, isInitializing: false,
  }),
}));
