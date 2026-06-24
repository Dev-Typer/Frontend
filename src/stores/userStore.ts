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
  setUser: (data: MeResponse) => void;
  setUserMe: (data: UserMeResponse) => void;
  setProfileUrl: (url: string | null) => void;
  setBannerUrl: (url: string | null) => void;
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
  setProfileUrl: (profileUrl) => set({ profileUrl }),
  setBannerUrl: (bannerUrl) => set({ bannerUrl }),
  clearUser: () => set({
    userId: null, username: null, role: null,
    profileUrl: null, bannerUrl: null, createdAt: null,
    totalCore: 0, currentStreak: 0,
    isLoggedIn: false,
  }),
}));
