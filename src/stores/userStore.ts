import { create } from 'zustand';
import type { MeResponse } from '@/apis/authApi';

export type UserRole = 'USER' | 'ADMIN';

interface UserState {
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  profileUrl: string | null;
  bannerUrl: string | null;
  createdAt: string | null;
  isLoggedIn: boolean;
  setUser: (data: MeResponse) => void;
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
  isLoggedIn: false,
  setUser: (data) => set({
    userId: data.userId,
    username: data.username,
    role: data.role,
    profileUrl: data.profileUrl,
    bannerUrl: data.bannerUrl,
    createdAt: data.createdAt,
    isLoggedIn: true,
  }),
  setProfileUrl: (profileUrl) => set({ profileUrl }),
  setBannerUrl: (bannerUrl) => set({ bannerUrl }),
  clearUser: () => set({
    userId: null, username: null, role: null,
    profileUrl: null, bannerUrl: null, createdAt: null,
    isLoggedIn: false,
  }),
}));
