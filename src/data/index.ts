import type { User, Opponent, RankEntry, ChallengeEntry, BattleEntry, ChallengeHistoryEntry, StreakEntry, StreakStats, TodaysChallenge, TierDef, Tier, SoloTrack, BestSnippet, CoreHistoryEntry } from '@/types';

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

const ME_BEST_SNIPPETS: BestSnippet[] = [
  { title: 'Array reduce 패턴', lang: 'JavaScript', diff: 'medium', core: 154, rank: 6,  total: 4120 },
  { title: 'Binary search',     lang: 'Python',     diff: 'medium', core: 142, rank: 9,  total: 3640 },
  { title: 'LRU Cache',         lang: 'TypeScript', diff: 'hard',   core: 139, rank: 12, total: 2980 },
  { title: 'Event emitter',     lang: 'TypeScript', diff: 'medium', core: 134, rank: 15, total: 2980 },
  { title: 'Memoize fn',        lang: 'JavaScript', diff: 'medium', core: 131, rank: 17, total: 4120 },
  { title: 'Two pointers',      lang: 'Python',     diff: 'medium', core: 128, rank: 19, total: 3640 },
  { title: 'Borrow checker dance', lang: 'Rust',    diff: 'hard',   core: 124, rank: 18, total: 1640 },
  { title: 'Move semantics',    lang: 'C++',        diff: 'hard',   core: 121, rank: 27, total: 2090 },
  { title: 'Promise chaining',  lang: 'JavaScript', diff: 'medium', core: 120, rank: 14, total: 4120 },
  { title: 'Goroutine pool',    lang: 'Go',         diff: 'hard',   core: 118, rank: 21, total: 1870 },
  { title: 'Channel select',    lang: 'Go',         diff: 'hard',   core: 116, rank: 23, total: 1870 },
  { title: 'Decorator pattern', lang: 'Python',     diff: 'hard',   core: 115, rank: 16, total: 3640 },
  { title: 'RAII guard',        lang: 'C++',        diff: 'hard',   core: 114, rank: 26, total: 2090 },
  { title: 'Coroutine flow',    lang: 'Kotlin',     diff: 'hard',   core: 113, rank: 22, total: 980 },
  { title: 'Type guards',       lang: 'TypeScript', diff: 'medium', core: 112, rank: 24, total: 2980 },
  { title: 'LINQ aggregate',    lang: 'C#',         diff: 'medium', core: 110, rank: 25, total: 1920 },
  { title: 'Recursion tree',    lang: 'Python',     diff: 'hard',   core: 109, rank: 30, total: 3640 },
  { title: 'Optional chaining', lang: 'Swift',      diff: 'medium', core: 108, rank: 29, total: 1230 },
  { title: 'Async/await flow',  lang: 'C#',         diff: 'medium', core: 107, rank: 28, total: 1920 },
  { title: 'Operator overload', lang: 'C++',        diff: 'hard',   core: 106, rank: 32, total: 2090 },
  { title: 'Pattern match',     lang: 'Scala',      diff: 'hard',   core: 105, rank: 33, total: 640 },
  { title: 'Trait objects',     lang: 'Rust',       diff: 'hard',   core: 103, rank: 31, total: 1640 },
  { title: 'Stream collect',    lang: 'Java',       diff: 'medium', core: 102, rank: 34, total: 2210 },
  { title: 'Linked list reverse', lang: 'C',        diff: 'medium', core: 99,  rank: 41, total: 1780 },
  { title: 'Iterator impl',     lang: 'Rust',       diff: 'hard',   core: 99,  rank: 38, total: 1640 },
  { title: 'Generics bound',    lang: 'Java',       diff: 'medium', core: 98,  rank: 39, total: 2210 },
  { title: 'Debounce util',     lang: 'TypeScript', diff: 'medium', core: 97,  rank: 38, total: 2980 },
  { title: 'Builder pattern',   lang: 'Java',       diff: 'medium', core: 96,  rank: 41, total: 2210 },
  { title: 'Block & yield',     lang: 'Ruby',       diff: 'easy',   core: 96,  rank: 38, total: 1310 },
  { title: 'Join + group by',   lang: 'SQL',        diff: 'medium', core: 95,  rank: 43, total: 1450 },
  { title: 'Monad bind',        lang: 'Haskell',    diff: 'hard',   core: 101, rank: 36, total: 410 },
  { title: 'Pointer arithmetic', lang: 'C',         diff: 'hard',   core: 100, rank: 37, total: 1780 },
  { title: 'Future await',      lang: 'Dart',       diff: 'medium', core: 94,  rank: 44, total: 760 },
  { title: 'Quicksort partition', lang: 'Python',   diff: 'medium', core: 93,  rank: 47, total: 3640 },
  { title: 'Spread merge',      lang: 'JavaScript', diff: 'easy',   core: 92,  rank: 50, total: 4120 },
  { title: 'Array map filter',  lang: 'PHP',        diff: 'easy',   core: 91,  rank: 52, total: 1490 },
  { title: 'Defer cleanup',     lang: 'Go',         diff: 'easy',   core: 90,  rank: 45, total: 1870 },
  { title: 'Pipe operator',     lang: 'Elixir',     diff: 'medium', core: 90,  rank: 49, total: 520 },
  { title: 'Param expansion',   lang: 'Bash',       diff: 'easy',   core: 89,  rank: 46, total: 690 },
  { title: 'Window function',   lang: 'SQL',        diff: 'easy',   core: 88,  rank: 47, total: 1450 },
  { title: 'Nullable struct',   lang: 'C#',         diff: 'easy',   core: 88,  rank: 53, total: 1920 },
  { title: 'Metatable index',   lang: 'Lua',        diff: 'medium', core: 86,  rank: 51, total: 380 },
  { title: 'dplyr mutate',      lang: 'R',          diff: 'easy',   core: 82,  rank: 58, total: 470 },
  { title: 'Regex substitution', lang: 'Perl',      diff: 'medium', core: 84,  rank: 55, total: 340 },
  { title: 'Dict comprehension', lang: 'Python',    diff: 'easy',   core: 78,  rank: 64, total: 3640 },
  { title: 'Closure counter',   lang: 'JavaScript', diff: 'easy',   core: 80,  rank: 61, total: 4120 },
  { title: 'CTE recursive',     lang: 'SQL',        diff: 'hard',   core: 91,  rank: 48, total: 1450 },
  { title: 'Bit manipulation',  lang: 'C',          diff: 'medium', core: 94,  rank: 44, total: 1780 },
];

const ME_CORE_HISTORY: CoreHistoryEntry[] = [
  { label: 'Jan', core: 1240 },
  { label: 'Feb', core: 1980 },
  { label: 'Mar', core: 2740 },
  { label: 'Apr', core: 3410 },
  { label: 'May', core: 4180 },
  { label: 'Jun', core: 4820 },
];

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
  totalCore: 4820,
  globalRank: 127,
  langRank: 45,
  uniqueSnippets: 106,
  currentStreak: 14,
  longestStreak: 24,
  bestSnippets: ME_BEST_SNIPPETS,
  coreHistory: ME_CORE_HISTORY,
  byLang: [
    { lang: 'JavaScript', core: 1680, snippets: 38, wpm: 98, plays: 112, top: { title: 'Array reduce 패턴', diff: 'medium', core: 154, rank: 6,  total: 4120 } },
    { lang: 'TypeScript', core: 1280, snippets: 24, wpm: 94, plays: 64,  top: { title: 'LRU Cache',         diff: 'hard',   core: 139, rank: 12, total: 2980 } },
    { lang: 'Python',     core: 1040, snippets: 21, wpm: 89, plays: 47,  top: { title: 'Binary search',     diff: 'medium', core: 142, rank: 9,  total: 3640 } },
    { lang: 'Java',       core: 760,  snippets: 16, wpm: 81, plays: 22,  top: { title: 'Stream collect',    diff: 'medium', core: 118, rank: 21, total: 2210 } },
    { lang: 'Go',         core: 640,  snippets: 14, wpm: 84, plays: 38,  top: { title: 'Goroutine pool',    diff: 'hard',   core: 124, rank: 18, total: 1870 } },
    { lang: 'C++',        core: 540,  snippets: 12, wpm: 79, plays: 28,  top: { title: 'Move semantics',    diff: 'hard',   core: 121, rank: 27, total: 2090 } },
    { lang: 'C#',         core: 470,  snippets: 10, wpm: 82, plays: 24,  top: { title: 'LINQ aggregate',    diff: 'medium', core: 110, rank: 25, total: 1920 } },
    { lang: 'C',          core: 360,  snippets: 8,  wpm: 76, plays: 18,  top: { title: 'Linked list reverse', diff: 'medium', core: 102, rank: 34, total: 1780 } },
    { lang: 'Rust',       core: 280,  snippets: 6,  wpm: 80, plays: 14,  top: { title: 'Borrow checker dance', diff: 'hard', core: 105, rank: 33, total: 1640 } },
    { lang: 'SQL',        core: 180,  snippets: 4,  wpm: 71, plays: 4,   top: { title: 'Window function',   diff: 'easy',   core: 88,  rank: 47, total: 1450 } },
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

// ─── Solo "playlist" — flat library of snippets ─────────────────────────────
export const SOLO_TRACKS: SoloTrack[] = [
  { id: 'js-debounce', lang: 'javascript', difficulty: 'medium', title: 'debounce()', avgWpm: 78,
    code: `const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};` },
  { id: 'js-fetch', lang: 'javascript', difficulty: 'medium', title: 'fetchUser()', avgWpm: 74,
    code: `function fetchUser(id) {\n  return fetch(\`/api/users/\${id}\`)\n    .then(res => res.json())\n    .then(data => ({ ...data, fetchedAt: Date.now() }));\n}` },
  { id: 'js-greet', lang: 'javascript', difficulty: 'easy', title: 'greet()', avgWpm: 92,
    code: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\ngreet("world");` },
  { id: 'js-emitter', lang: 'javascript', difficulty: 'hard', title: 'EventEmitter', avgWpm: 61,
    code: `class EventEmitter {\n  constructor() { this.events = {}; }\n  on(event, fn) {\n    (this.events[event] ||= []).push(fn);\n    return () => this.off(event, fn);\n  }\n  emit(event, ...args) {\n    (this.events[event] || []).forEach(fn => fn(...args));\n  }\n}` },
  { id: 'ts-result', lang: 'typescript', difficulty: 'medium', title: 'Result<T>', avgWpm: 70,
    code: `type Result<T, E = Error> =\n  | { ok: true; value: T }\n  | { ok: false; error: E };\n\nfunction tryParse<T>(s: string): Result<T> {\n  try { return { ok: true, value: JSON.parse(s) }; }\n  catch (e) { return { ok: false, error: e as Error }; }\n}` },
  { id: 'ts-pipe', lang: 'typescript', difficulty: 'hard', title: 'pipe()', avgWpm: 58,
    code: `const pipe = <T>(...fns: Array<(x: T) => T>) =>\n  (input: T): T => fns.reduce((acc, fn) => fn(acc), input);\n\nconst clean = pipe<string>(\n  s => s.trim(),\n  s => s.toLowerCase(),\n);` },
  { id: 'py-fib', lang: 'python', difficulty: 'easy', title: 'fibonacci()', avgWpm: 88,
    code: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a` },
  { id: 'py-cache', lang: 'python', difficulty: 'medium', title: 'lru_cache', avgWpm: 72,
    code: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)` },
  { id: 'py-comp', lang: 'python', difficulty: 'medium', title: 'comprehension', avgWpm: 75,
    code: `pairs = [\n    (x, y)\n    for x in range(3)\n    for y in range(3)\n    if x != y\n]` },
  { id: 'go-map', lang: 'go', difficulty: 'medium', title: 'Map[T, U]', avgWpm: 66,
    code: `func Map[T, U any](s []T, f func(T) U) []U {\n    r := make([]U, len(s))\n    for i, v := range s {\n        r[i] = f(v)\n    }\n    return r\n}` },
  { id: 'go-server', lang: 'go', difficulty: 'hard', title: 'http.Handler', avgWpm: 59,
    code: `func handler(w http.ResponseWriter, r *http.Request) {\n    name := r.URL.Query().Get("name")\n    if name == "" {\n        name = "world"\n    }\n    fmt.Fprintf(w, "Hello, %s!", name)\n}` },
  { id: 'java-sum', lang: 'java', difficulty: 'easy', title: 'sum loop', avgWpm: 80,
    code: `int sum = 0;\nfor (int i = 1; i <= n; i++) {\n    sum += i;\n}\nreturn sum;` },
  { id: 'java-stream', lang: 'java', difficulty: 'medium', title: 'Stream', avgWpm: 64,
    code: `List<String> names = users.stream()\n    .filter(u -> u.isActive())\n    .map(User::getName)\n    .sorted()\n    .collect(Collectors.toList());` },
  { id: 'sql-join', lang: 'sql', difficulty: 'easy', title: 'LEFT JOIN', avgWpm: 71,
    code: `SELECT users.name, COUNT(orders.id) AS total\nFROM users\nLEFT JOIN orders ON orders.user_id = users.id\nGROUP BY users.id\nORDER BY total DESC\nLIMIT 10;` },
  { id: 'sql-window', lang: 'sql', difficulty: 'hard', title: 'RANK()', avgWpm: 57,
    code: `SELECT\n  RANK() OVER (ORDER BY rating DESC) AS rank,\n  handle, rating\nFROM users\nWHERE last_seen > NOW() - INTERVAL '30 days'\nLIMIT 100;` },
  { id: 'js-long-store', lang: 'javascript', difficulty: 'hard', title: 'createStore (long)', avgWpm: 52,
    code: `function createStore(reducer, initialState) {\n  let state = initialState;\n  let listeners = [];\n\n  function getState() {\n    return state;\n  }\n\n  function dispatch(action) {\n    state = reducer(state, action);\n    listeners.forEach((listener) => listener(state));\n    return action;\n  }\n\n  function subscribe(listener) {\n    listeners.push(listener);\n    return function unsubscribe() {\n      listeners = listeners.filter((l) => l !== listener);\n    };\n  }\n\n  function replaceReducer(nextReducer) {\n    reducer = nextReducer;\n    dispatch({ type: "@@INIT" });\n  }\n\n  dispatch({ type: "@@INIT" });\n  return { getState, dispatch, subscribe, replaceReducer };\n}` },
  { id: 'py-long-bfs', lang: 'python', difficulty: 'hard', title: 'Dijkstra (long)', avgWpm: 50,
    code: `import heapq\nfrom collections import defaultdict\n\ndef dijkstra(graph, start):\n    distances = {node: float("inf") for node in graph}\n    distances[start] = 0\n    visited = set()\n    queue = [(0, start)]\n\n    while queue:\n        current_dist, current = heapq.heappop(queue)\n        if current in visited:\n            continue\n        visited.add(current)\n\n        for neighbor, weight in graph[current].items():\n            distance = current_dist + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(queue, (distance, neighbor))\n\n    return distances` },
];

export const LANG_ICON: Record<string, string> = {
  javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  rust: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg',
  'c++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
  'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  ruby: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
  php: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  swift: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
  kotlin: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
  sql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  dart: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
  scala: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg',
  elixir: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elixir/elixir-original.svg',
  haskell: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/haskell/haskell-original.svg',
  lua: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg',
  r: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg',
  perl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/perl/perl-original.svg',
  bash: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
};
