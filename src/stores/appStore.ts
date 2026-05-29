import { create } from 'zustand';
import type { AppTweaks, Design, Theme, Lang, RaceViz, CaretStyle, Density } from '@/types';

interface AppState extends AppTweaks {
  setDesign: (v: Design) => void;
  setTheme: (v: Theme) => void;
  toggleTheme: () => void;
  setLang: (v: Lang) => void;
  setLoggedIn: (v: boolean) => void;
  setRaceViz: (v: RaceViz) => void;
  setCaret: (v: CaretStyle) => void;
  setDensity: (v: Density) => void;
}

export const useAppStore = create<AppState>((set) => ({
  design: 'editor',
  theme: 'dark',
  lang: 'ko',
  loggedIn: false,
  raceViz: 'avatars',
  caret: 'line',
  density: 'comfortable',

  setDesign: (design) => set({ design }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setLang: (lang) => set({ lang }),
  setLoggedIn: (loggedIn) => set({ loggedIn }),
  setRaceViz: (raceViz) => set({ raceViz }),
  setCaret: (caret) => set({ caret }),
  setDensity: (density) => set({ density }),
}));
