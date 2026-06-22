export type Design = 'editor' | 'bold' | 'corporate' | 'contemporary';
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'ko';
export type RaceViz = 'avatars' | 'bars' | 'lanes';
export type CaretStyle = 'line' | 'under' | 'block';
export type Density = 'compact' | 'comfortable';
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AppTweaks {
  design: Design;
  theme: Theme;
  lang: Lang;
  loggedIn: boolean;
  raceViz: RaceViz;
  caret: CaretStyle;
  density: Density;
}

export interface BestSnippet {
  title: string;
  lang: string;
  diff: Difficulty;
  core: number;
  rank: number;
  total: number;
}

export interface CoreHistoryEntry {
  label: string;
  core: number;
}

export interface TopSnippet {
  title: string;
  diff: Difficulty;
  core: number;
  rank: number;
  total: number;
}

export interface User {
  handle: string;
  joined: string;
  tier: Tier;
  rating: number;
  avatarHue: number;
  totalPlays: number;
  avgWpm: number;
  maxWpm: number;
  avgAcc: number;
  byLang: LangStat[];
  totalCore: number;
  globalRank: number;
  langRank: number;
  uniqueSnippets: number;
  currentStreak: number;
  longestStreak: number;
  bestSnippets: BestSnippet[];
  coreHistory: CoreHistoryEntry[];
}

export interface SoloTrack {
  id: string;
  lang: string;
  difficulty: Difficulty;
  title: string;
  avgWpm: number;
  code: string;
}

export interface LangStat {
  lang: string;
  wpm: number;
  plays?: number;
  core?: number;
  snippets?: number;
  top?: TopSnippet;
}

export interface Opponent {
  handle: string;
  tier: Tier;
  hue: number;
  rating: number;
}

export interface RankEntry {
  rank: number;
  handle: string;
  tier: Tier;
  rating: number;
  wpm: number;
  me?: boolean;
}

export interface ChallengeEntry {
  rank: number;
  handle: string;
  tier: Tier;
  wpm: number;
  acc: number;
  rating?: number;
  me?: boolean;
}

export interface BattleEntry {
  id: number;
  when: string;
  opponents: string[];
  myRank: number;
  myWpm: number;
  delta: number;
  lang: string;
}

export interface ChallengeHistoryEntry {
  date: string;
  wpm: number;
  rank: number;
  total: number;
}

export interface StreakEntry {
  date: string;
  submitted: boolean;
  wpm: number | null;
  day: number;
}

export interface StreakStats {
  current: number;
  best: number;
  total: number;
  days: number;
}

export interface TodaysChallenge {
  date: string;
  language: string;
  difficulty: string;
  code: string;
}

export interface TierDef {
  label: string;
  range: string;
  color: string;
  glyph: string;
}

export interface TypingProgress {
  index: number;
  total: number;
  wpm: number;
  acc: number;
  elapsed: number;
  errors: number;
  finished: boolean;
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

export interface TypingResult {
  wpm: number;
  rawWpm: number;
  acc: number;
  elapsed: number;
  errors: number;
  longestCombo: number;
  typos: TypoData[];
  replayData: ReplayEvent[];
}

export interface Racer {
  handle: string;
  hue: number;
  tier: Tier;
  you: boolean;
  progress: number;
  wpm: number;
  done: boolean;
}

export interface BotState extends Opponent {
  targetWpm: number;
  progress: number;
  done: boolean;
  finishMs: number | null;
}

export interface FinalRanking {
  myRank: number;
  totalPlayers: number;
  delta: number;
  wpm: number;
  acc: number;
  elapsed: number;
  players: FinalPlayer[];
}

export interface FinalPlayer {
  handle: string;
  hue: number;
  tier: Tier;
  you: boolean;
  wpm: number;
  acc: number;
  finishMs: number | null;
  progress: number;
}

export type Route = 'home' | 'solo' | 'battle' | 'daily' | 'ranking' | 'mypage' | 'login';
