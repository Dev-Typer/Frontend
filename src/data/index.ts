import type { User, Opponent, RankEntry, ChallengeEntry, BattleEntry, ChallengeHistoryEntry, StreakEntry, StreakStats, TodaysChallenge, TierDef, Tier } from '@/types';

export const CODE_SNIPPETS: Record<string, Record<string, string[]>> = {
  javascript: {
    easy: [
      `const sum = (a, b) => a + b;\nconst double = n => n * 2;\nconsole.log(sum(2, 3));`,
      `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\ngreet("world");`,
    ],
    medium: [
      `const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};`,
      `function fetchUser(id) {\n  return fetch(\`/api/users/\${id}\`)\n    .then(res => res.json())\n    .then(data => ({ ...data, fetchedAt: Date.now() }));\n}`,
    ],
    hard: [
      `class EventEmitter {\n  constructor() { this.events = {}; }\n  on(event, fn) {\n    (this.events[event] ||= []).push(fn);\n    return () => this.off(event, fn);\n  }\n  off(event, fn) {\n    this.events[event] = (this.events[event] || []).filter(f => f !== fn);\n  }\n  emit(event, ...args) {\n    (this.events[event] || []).forEach(fn => fn(...args));\n  }\n}`,
    ],
  },
  typescript: {
    medium: [
      `type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };\n\nfunction tryParse<T>(s: string): Result<T> {\n  try { return { ok: true, value: JSON.parse(s) }; }\n  catch (e) { return { ok: false, error: e as Error }; }\n}`,
    ],
  },
  python: {
    easy: [
      `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a`,
    ],
    medium: [
      `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`,
    ],
  },
  go: {
    medium: [
      `func Map[T, U any](s []T, f func(T) U) []U {\n    r := make([]U, len(s))\n    for i, v := range s {\n        r[i] = f(v)\n    }\n    return r\n}`,
    ],
  },
  java: {
    easy: [`int sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += i;\n}\nreturn sum;`],
  },
  sql: {
    easy: [`SELECT users.name, COUNT(orders.id) AS total\nFROM users\nLEFT JOIN orders ON orders.user_id = users.id\nGROUP BY users.id\nORDER BY total DESC\nLIMIT 10;`],
  },
};

export const TODAYS_CHALLENGE: TodaysChallenge = {
  date: '2026-05-27',
  language: 'TypeScript',
  difficulty: 'medium',
  code: `type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };\n\nfunction tryParse<T>(s: string): Result<T> {\n  try { return { ok: true, value: JSON.parse(s) }; }\n  catch (e) { return { ok: false, error: e as Error }; }\n}`,
};

export const ME: User = {
  handle: 'jmk_codes',
  joined: '2026-02-14',
  tier: 'platinum',
  rating: 1842,
  avatarHue: 170,
  totalPlays: 287,
  avgWpm: 92,
  maxWpm: 134,
  avgAcc: 96.4,
  byLang: [
    { lang: 'JavaScript', wpm: 98, plays: 112 },
    { lang: 'TypeScript', wpm: 94, plays: 64 },
    { lang: 'Python', wpm: 89, plays: 47 },
    { lang: 'Go', wpm: 81, plays: 38 },
    { lang: 'Java', wpm: 76, plays: 22 },
    { lang: 'SQL', wpm: 71, plays: 4 },
  ],
};

export const TIER_DEF: Record<Tier, TierDef> = {
  bronze:   { label: 'Bronze',   range: '0 – 40 WPM',    color: 'bronze',   glyph: 'B' },
  silver:   { label: 'Silver',   range: '41 – 60 WPM',   color: 'silver',   glyph: 'S' },
  gold:     { label: 'Gold',     range: '61 – 80 WPM',   color: 'gold',     glyph: 'G' },
  platinum: { label: 'Platinum', range: '81 – 100 WPM',  color: 'platinum', glyph: 'P' },
  diamond:  { label: 'Diamond',  range: '101 – 130 WPM', color: 'diamond',  glyph: 'D' },
  master:   { label: 'Master',   range: '131+ WPM',      color: 'master',   glyph: 'M' },
};

export const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];

export const OPPONENTS: Opponent[] = [
  { handle: 'neo_tachyon',  tier: 'diamond',  hue: 220, rating: 2104 },
  { handle: 'ada_dev',      tier: 'platinum', hue: 290, rating: 1788 },
  { handle: 'raku_san',     tier: 'gold',     hue: 35,  rating: 1520 },
  { handle: 'sirius',       tier: 'master',   hue: 0,   rating: 2412 },
  { handle: 'vivid_void',   tier: 'platinum', hue: 320, rating: 1955 },
  { handle: 'bento_box',    tier: 'silver',   hue: 60,  rating: 1180 },
  { handle: 'halcyon',      tier: 'diamond',  hue: 180, rating: 2210 },
];

export const GLOBAL_RANKING: RankEntry[] = [
  { rank: 1,  handle: 'siren_void',   tier: 'master',   rating: 2541, wpm: 162 },
  { rank: 2,  handle: 'sirius',       tier: 'master',   rating: 2487, wpm: 158 },
  { rank: 3,  handle: 'halcyon',      tier: 'master',   rating: 2402, wpm: 149 },
  { rank: 4,  handle: 'neo_tachyon',  tier: 'diamond',  rating: 2188, wpm: 141 },
  { rank: 5,  handle: 'vivid_void',   tier: 'diamond',  rating: 2104, wpm: 138 },
  { rank: 6,  handle: 'kestrel',      tier: 'diamond',  rating: 2061, wpm: 136 },
  { rank: 7,  handle: 'moonbase',     tier: 'diamond',  rating: 2014, wpm: 132 },
  { rank: 8,  handle: 'tako_dev',     tier: 'diamond',  rating: 1988, wpm: 130 },
  { rank: 9,  handle: 'raku_san',     tier: 'platinum', rating: 1922, wpm: 122 },
  { rank: 10, handle: 'ada_dev',      tier: 'platinum', rating: 1889, wpm: 118 },
  { rank: 11, handle: 'jmk_codes',    tier: 'platinum', rating: 1842, wpm: 116, me: true },
  { rank: 12, handle: 'boundless',    tier: 'platinum', rating: 1810, wpm: 114 },
  { rank: 13, handle: 'miso_paste',   tier: 'platinum', rating: 1772, wpm: 111 },
  { rank: 14, handle: 'fern_glow',    tier: 'platinum', rating: 1745, wpm: 109 },
  { rank: 15, handle: 'cinder',       tier: 'gold',     rating: 1644, wpm: 102 },
];

export const CHALLENGE_BOARD: ChallengeEntry[] = [
  { rank: 1,  handle: 'siren_void',   tier: 'master',   wpm: 161, acc: 99.4 },
  { rank: 2,  handle: 'halcyon',      tier: 'master',   wpm: 154, acc: 98.8 },
  { rank: 3,  handle: 'neo_tachyon',  tier: 'diamond',  wpm: 142, acc: 99.1 },
  { rank: 4,  handle: 'vivid_void',   tier: 'diamond',  wpm: 137, acc: 97.9 },
  { rank: 5,  handle: 'tako_dev',     tier: 'diamond',  wpm: 134, acc: 98.4 },
  { rank: 6,  handle: 'kestrel',      tier: 'diamond',  wpm: 131, acc: 97.2 },
  { rank: 7,  handle: 'ada_dev',      tier: 'platinum', rating: 1788, wpm: 121, acc: 96.5 },
  { rank: 8,  handle: 'raku_san',     tier: 'platinum', wpm: 118, acc: 97.8 },
  { rank: 9,  handle: 'jmk_codes',    tier: 'platinum', wpm: 114, acc: 95.2, me: true },
  { rank: 10, handle: 'miso_paste',   tier: 'platinum', wpm: 109, acc: 96.0 },
];

export const RECENT_BATTLES: BattleEntry[] = [
  { id: 1, when: '2h ago',    opponents: ['neo_tachyon','ada_dev','raku_san'],   myRank: 1, myWpm: 118, delta: 24,  lang: 'JavaScript' },
  { id: 2, when: '5h ago',    opponents: ['vivid_void','bento_box'],             myRank: 2, myWpm: 102, delta: 8,   lang: 'Python' },
  { id: 3, when: 'Yesterday', opponents: ['sirius','halcyon','neo_tachyon'],     myRank: 4, myWpm: 96,  delta: -22, lang: 'TypeScript' },
  { id: 4, when: 'Yesterday', opponents: ['ada_dev'],                            myRank: 1, myWpm: 121, delta: 16,  lang: 'JavaScript' },
  { id: 5, when: '2d ago',    opponents: ['bento_box','raku_san','ada_dev'],     myRank: 2, myWpm: 99,  delta: 11,  lang: 'Go' },
  { id: 6, when: '2d ago',    opponents: ['kestrel','tako_dev'],                 myRank: 3, myWpm: 104, delta: -7,  lang: 'JavaScript' },
  { id: 7, when: '3d ago',    opponents: ['moonbase','fern_glow','cinder'],      myRank: 1, myWpm: 115, delta: 18,  lang: 'TypeScript' },
];

export const CHALLENGE_HISTORY: ChallengeHistoryEntry[] = [
  { date: '2026-05-26', wpm: 108, rank: 14,  total: 4218 },
  { date: '2026-05-25', wpm: 102, rank: 19,  total: 3987 },
  { date: '2026-05-24', wpm: 114, rank: 9,   total: 4502 },
  { date: '2026-05-23', wpm: 96,  rank: 31,  total: 3771 },
  { date: '2026-05-22', wpm: 121, rank: 6,   total: 4189 },
];

export const STREAK_HISTORY: StreakEntry[] = (() => {
  const out: StreakEntry[] = [];
  const today = new Date('2026-05-27T12:00:00Z');
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const isoDate = d.toISOString().slice(0, 10);
    const dayFromToday = i;
    let submitted = false;
    let wpm: number | null = null;
    if (dayFromToday <= 13) {
      submitted = true;
      wpm = 90 + Math.round(Math.sin(i * 0.5) * 18 + Math.cos(i) * 8);
    } else if (dayFromToday >= 16 && dayFromToday <= 38) {
      submitted = true;
      wpm = 84 + Math.round(Math.sin(i * 0.7) * 22);
    } else {
      const seed = Math.sin(i * 13.37) * 10000;
      submitted = (seed - Math.floor(seed)) > 0.5;
      wpm = submitted ? 75 + Math.round(Math.cos(i * 0.4) * 18) : null;
    }
    out.push({ date: isoDate, submitted, wpm, day: d.getUTCDay() });
  }
  return out;
})();

export const STREAK_STATS: StreakStats = (() => {
  let current = 0, best = 0, run = 0, total = 0;
  for (let i = STREAK_HISTORY.length - 1; i >= 0; i--) {
    if (STREAK_HISTORY[i].submitted) current++;
    else break;
  }
  for (const e of STREAK_HISTORY) {
    if (e.submitted) { run++; total++; best = Math.max(best, run); }
    else run = 0;
  }
  return { current, best, total, days: STREAK_HISTORY.length };
})();
