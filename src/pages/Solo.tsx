import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import SectionHead from '@/components/SectionHead';
import Pill from '@/components/Pill';
import PlayEditor from '@/components/PlayEditor';
import Avatar from '@/components/Avatar';
import {
  IconPlay, IconRefresh, IconSettings, IconKeyboard, IconArrowRight, IconArrowUp, IconArrowDown,
} from '@/components/icons/Icons';
import type { TypingProgress, TypingResult, SoloTrack } from '@/types';
import { LANG_ICON } from '@/data';
import { getPublicSnippet, getRandomSnippet } from '@/apis/snippetApi';
import type { SnippetLanguage } from '@/apis/snippetApi';
import { saveSnippetResult, getSnippetRanking } from '@/apis/snippetResultApi';
import type { RankingItem } from '@/apis/snippetResultApi';

type Phase = 'setup' | 'typing' | 'result';

const LANGS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'go',         label: 'Go'         },
  { id: 'java',       label: 'Java'       },
  { id: 'kotlin',     label: 'Kotlin'     },
  { id: 'c++',        label: 'C++'        },
  { id: 'c#',         label: 'C#'         },
  { id: 'c',          label: 'C'          },
  { id: 'rust',       label: 'Rust'       },
];
const DIFFS = [
  { id: 'easy',   label: 'Easy',   chars: '~80 chars'  },
  { id: 'medium', label: 'Medium', chars: '~180 chars' },
  { id: 'hard',   label: 'Hard',   chars: '~320 chars' },
];

const kbdClass = 'inline-block py-px px-1.5 mx-0.5 bg-dt-hover border-[0.5px] border-dt-border rounded font-dt-mono text-[11px] text-dt-text-2';

function fileExtFor(lang: string) {
  return ({ javascript: '.js', typescript: '.ts', python: '.py', go: '.go', java: '.java', kotlin: '.kt', 'c++': '.cpp', 'c#': '.cs', c: '.c', rust: '.rs' } as Record<string, string>)[lang] || '.txt';
}

function toLangKey(lang: SnippetLanguage): string {
  return lang.toLowerCase();
}

const UI_TO_API_LANG: Record<string, SnippetLanguage> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  go: 'Go', java: 'Java', kotlin: 'Kotlin',
  'c++': 'C++', 'c#': 'C#', c: 'C', rust: 'Rust',
};

// ─── CORE scoring ────────────────────────────────────────────────────────────
function computeCore(wpm: number, acc: number, diff: string, len: number) {
  const diffW = ({ easy: 1.0, medium: 1.3, hard: 1.6 } as Record<string, number>)[diff.toLowerCase()] || 1.3;
  const lenW = Math.min(2.0, Math.max(0.5, len / 200));
  const nWpm = wpm * (acc / 100);
  return { core: Math.round(nWpm * diffW * lenW), nWpm: +nWpm.toFixed(1), diffW, lenW };
}
function readBestMap(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('dt_core_best') || '{}'); } catch { return {}; }
}
function writeBest(id: string, core: number) {
  try {
    const m = readBestMap();
    m[id] = Math.max(m[id] || 0, core);
    localStorage.setItem('dt_core_best', JSON.stringify(m));
  } catch { /* noop */ }
}
function totalCoreSum(): number {
  return Object.values(readBestMap()).reduce((s, v) => s + v, 0);
}

// ─── Setup ────────────────────────────────────────────────────────────────────
interface SoloSetupProps {
  lang: string; setLang: (l: string) => void; onStart: () => void;
}

const SoloSetup = ({ lang, setLang, onStart }: SoloSetupProps) => {
  const t = useT();
  const langLabel = LANGS.find((l) => l.id === lang)?.label;
  return (
    <div className="pt-2">
      <SectionHead kicker="Solo practice" title="Pick a language. Start typing." />

      <div className="relative overflow-hidden rounded-dt-md py-10 px-10 pb-11 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--dt-card)_70%,transparent),color-mix(in_oklab,#2E6BFF_12%,transparent))] [backdrop-filter:blur(14px)_saturate(1.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_var(--dt-border),0_20px_52px_-28px_rgba(46,107,255,0.5)]">
        <img src="/assets/solo.png" alt="" className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-[150%] w-auto max-w-[46%] object-contain opacity-90 pointer-events-none [filter:drop-shadow(0_12px_30px_rgba(46,107,255,0.5))]" />

        <div className="relative z-[2] max-w-[560px]">
          <div className="dt-label mb-3">{t('Language')}</div>
          <div className="flex flex-wrap gap-2 mb-7">
            {LANGS.map((l) => (
              <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>
                {LANG_ICON[l.id] && (
                  <img src={LANG_ICON[l.id]} alt="" className="w-[18px] h-[18px] object-contain align-middle inline-block mr-1" />
                )}
                {l.label}
              </Pill>
            ))}
          </div>

          <button className="dt-btn dt-btn-primary dt-btn-lg text-base px-7 min-h-[54px]" onClick={onStart}>
            <IconPlay size={18} /> {langLabel} {t('random start')}
          </button>
          <p className="dt-caption mt-3.5 max-w-[380px]">
            {t('A random snippet will be picked for the selected language.')}
          </p>
        </div>
      </div>

      <div className="dt-caption mt-[18px] text-dt-text-2">
        <IconKeyboard size={14} className="align-middle mr-1.5" />
        {t('Tip: focus on accuracy first — fixed mistakes still count against your accuracy score.')}
      </div>
    </div>
  );
};

// ─── Typing ───────────────────────────────────────────────────────────────────
interface SoloTypingProps {
  snippet: string; lang: string; diff: string; progress: TypingProgress; setProgress: (p: TypingProgress) => void;
  onFinish: (r: TypingResult) => void; resetKey: number;
  onReset: () => void; onChangeSettings: () => void; realLang: string;
}

const SoloTyping = ({ snippet, lang, diff, progress, setProgress, onFinish, resetKey, onReset, onChangeSettings, realLang }: SoloTypingProps) => {
  const t = useT();
  const caret = useAppStore((s) => s.caret);
  const density = useAppStore((s) => s.density);
  const dispLang = realLang || lang;
  const pct = (progress.index / Math.max(1, progress.total)) * 100;
  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {LANG_ICON[dispLang] && (
            <img src={LANG_ICON[dispLang]} alt="" className="w-[26px] h-[26px] object-contain" />
          )}
          <span className="dt-h2 m-0">{LANGS.find((l) => l.id === dispLang)?.label || dispLang}</span>
          <span className="dt-chip">{t(DIFFS.find((d) => d.id === diff.toLowerCase())?.label ?? '')}</span>
        </div>
        <div className="flex items-center gap-[22px]">
          <InlineStat label={t('WPM')} value={progress.wpm} accent />
          <InlineStat label={t('Accuracy')} value={progress.acc.toFixed(0)} unit="%" />
          <InlineStat label={t('Time')} value={(progress.elapsed / 1000).toFixed(0)} unit="s" />
          <div className="w-px h-7 bg-dt-border" />
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onReset}>
            <IconRefresh size={14} /> {t('Restart')}
          </button>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}>
            <IconSettings size={14} /> {t('Settings')}
          </button>
        </div>
      </div>

      <div className="dt-progress mb-[18px] h-1.5">
        <div style={{ width: `${pct}%` }} />
      </div>

      <PlayEditor
        fill
        code={snippet}
        resetKey={resetKey}
        caretStyle={caret}
        fontSize={density === 'compact' ? 17 : 20}
        onProgress={setProgress}
        onFinish={onFinish}
        fileName={`snippet${fileExtFor(dispLang)}`}
        index={progress.index}
        total={progress.total}
      />

      <div className="dt-caption mt-3.5 text-dt-text-2 text-center shrink-0">
        <kbd className={kbdClass}>Tab</kbd> + <kbd className={kbdClass}>Enter</kbd> {t('to restart')}
      </div>
    </div>
  );
};

const InlineStat = ({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: boolean }) => (
  <div className="flex flex-col items-end leading-none">
    <span className={`dt-mono dt-tabular text-2xl font-semibold ${accent ? 'text-dt-primary' : 'text-dt-text'}`}>
      {value}<span className="text-xs text-dt-text-3">{unit}</span>
    </span>
    <span className="text-[10px] tracking-[0.08em] uppercase text-dt-text-3 mt-[3px]">{label}</span>
  </div>
);

// ─── Result helpers ───────────────────────────────────────────────────────────
function soloDerived(result: TypingResult, snippet: string) {
  const len = snippet.length;
  const errors = result.errors || 0;
  const combo = Math.max(8, Math.round(len / (errors + 1)));
  const n = Math.min(60, Math.max(14, Math.round(len / 6)));
  const base = result.wpm;
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = Math.sin((i + 1) * 12.9898 + len * 0.013) * 43758.5453;
    const r = seed - Math.floor(seed);
    const ramp = i < 3 ? 0.6 + i * 0.13 : 1;
    const swing = (r - 0.5) * (i < 6 ? 46 : 22);
    const dip = (Math.sin(i * 1.7) > 0.86) ? -28 : 0;
    samples.push(Math.max(20, Math.round(base * ramp + swing + dip)));
  }
  return { combo, samples };
}

const StatCard = ({ label, value, unit, sub }: { label: string; value: string | number; unit?: string; sub?: string }) => (
  <div className="dt-card p-5">
    <div className="dt-label mb-1.5">{label}</div>
    <div className="dt-mono dt-tabular text-[28px] font-medium">
      {value}{unit && <span className="text-[15px] text-dt-text-2">{unit}</span>}
    </div>
    {sub && <div className="dt-caption mt-1.5">{sub}</div>}
  </div>
);

const SoloWpmGraph = ({ result, snippet }: { result: TypingResult; snippet: string }) => {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const { samples } = soloDerived(result, snippet);
  const vals = samples;
  const min = Math.min(...vals) - 10, max = Math.max(...vals) + 10;
  const w = 980, h = 220, pad = 14, base = h - 16;
  const xs = vals.map((_, i) => (i / (vals.length - 1)) * (w - 2 * pad) + pad);
  const ys = vals.map((v) => base - ((v - min) / (max - min || 1)) * (base - pad));
  const line = vals.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = `${line} L ${xs[xs.length - 1]} ${base} L ${xs[0]} ${base} Z`;
  const dips = vals.map((v, i) => (i > 0 && i < vals.length - 1 && v < vals[i - 1] - 18 && v < vals[i + 1] - 6) ? i : -1).filter((i) => i >= 0);
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="py-[18px] px-6 flex items-center gap-3 border-b-[0.5px] border-dt-border">
        <span className="dt-h3 m-0">{t('WPM over time')}</span>
        <span className="inline-flex items-center gap-1.5 ml-auto">
          <span className="w-[9px] h-[9px] rounded-full bg-dt-primary" />
          <span className="dt-caption">WPM</span>
          <span className="w-[9px] h-[9px] rounded-full bg-dt-error ml-2.5" />
          <span className="dt-caption">{t('error dip')}</span>
        </span>
      </div>
      <div className="pt-4 px-6 pb-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
          <defs>
            <linearGradient id="soloWpmFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={0} x2={w} y1={(i + 1) * base / 4} y2={(i + 1) * base / 4} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.5" />
          ))}
          <path d={area} fill="url(#soloWpmFade)" />
          <path d={line} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {dips.map((i) => <circle key={i} cx={xs[i]} cy={ys[i]} r={4} fill="var(--dt-error)" />)}
          {hi !== null && <line x1={xs[hi]} x2={xs[hi]} y1={pad - 6} y2={base} stroke="var(--dt-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
          {vals.map((_, i) => (
            <rect key={i} x={xs[i] - (w / vals.length) / 2} y={0} width={w / vals.length} height={base} fill="transparent"
              onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi((p) => p === i ? null : p)} />
          ))}
          {hi !== null && (() => {
            const tw = 86, tx = Math.min(Math.max(xs[hi] - tw / 2, 4), w - tw - 4), ty = Math.max(ys[hi] - 42, 4);
            return (
              <g pointerEvents="none">
                <circle cx={xs[hi]} cy={ys[hi]} r={4.5} fill="var(--dt-primary)" />
                <rect x={tx} y={ty} width={tw} height={32} rx={7} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx + tw / 2} y={ty + 21} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">{vals[hi]} <tspan fontSize="9" fill="var(--dt-text-3)">WPM</tspan></text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

const MistypedLetters = ({ result, snippet }: { result: TypingResult; snippet: string }) => {
  const t = useT();
  const errors = result.errors || 0;
  const counts: Record<string, number> = {};
  const hard = '(){}[];:.,=>&|_$';
  for (const ch of snippet) {
    if (ch === ' ' || ch === '\n' || ch === '\t') continue;
    const weight = hard.includes(ch) ? 3 : /[a-zA-Z0-9]/.test(ch) ? 1 : 2;
    counts[ch] = (counts[ch] || 0) + weight;
  }
  const topChars = Object.entries(counts).map(([ch, w]) => ({ ch, w })).sort((a, b) => b.w - a.w).slice(0, 8);
  const totalW = topChars.reduce((s, b) => s + b.w, 0) || 1;
  const scored = topChars
    .map((b, i) => ({ ...b, n: Math.max(0, Math.round(errors * (b.w / totalW)) - (i > 3 ? 1 : 0)) }))
    .filter((b) => b.n > 0);
  const maxN = Math.max(1, ...scored.map((b) => b.n));
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="py-[18px] px-6 border-b-[0.5px] border-dt-border">
        <span className="dt-h3 m-0">{t('Most mistyped')}</span>
      </div>
      <div className="py-4 px-6 flex flex-col gap-2.5">
        {scored.length === 0 ? (
          <span className="dt-caption">{t('Clean run — no notable mistypes. 🎯')}</span>
        ) : scored.map((b) => (
          <div key={b.ch} className="grid grid-cols-[28px_1fr_28px] gap-3 items-center">
            <span className="dt-mono text-[15px] text-dt-text text-center bg-dt-hover rounded-md py-0.5">{b.ch}</span>
            <div className="h-2.5 bg-dt-hover rounded-full overflow-hidden">
              <div className="h-full bg-dt-error rounded-full" style={{ width: `${(b.n / maxN) * 100}%` }} />
            </div>
            <span className="dt-mono dt-tabular text-[13px] text-dt-text-2 text-right">{b.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WordChips = ({ result: _result, snippet }: { result: TypingResult; snippet: string }) => {
  const t = useT();
  const words = Array.from(new Set(snippet.split(/[^A-Za-z_]+/).filter((w) => w.length >= 3)));
  const scored = words.map((w) => {
    const seed = w.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return { w, s: (Math.sin(seed) + 1) / 2 - (w.length > 7 ? 0.25 : 0) };
  }).sort((a, b) => b.s - a.s);
  const fast = scored.slice(0, 6).map((x) => x.w);
  const slow = scored.slice(-5).map((x) => x.w).reverse();
  const Chip = ({ word, ok }: { word: string; ok?: boolean }) => (
    <span className={`dt-mono text-[12.5px] py-1 px-2.5 rounded-full ${ok ? 'text-dt-success bg-[color-mix(in_oklab,var(--dt-success)_14%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--dt-success)_35%,transparent)]' : 'text-dt-error bg-[color-mix(in_oklab,var(--dt-error)_14%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--dt-error)_35%,transparent)]'}`}>{word}</span>
  );
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="py-[18px] px-6 border-b-[0.5px] border-dt-border">
        <span className="dt-h3 m-0">{t('Word breakdown')}</span>
      </div>
      <div className="py-4 px-6 flex flex-col gap-3.5">
        <div>
          <div className="dt-label mb-2.5 text-dt-success">⚡ {t('Fast words')}</div>
          <div className="flex flex-wrap gap-1.5">
            {fast.map((w) => <Chip key={w} word={w} ok />)}
          </div>
        </div>
        <div>
          <div className="dt-label mb-2.5 text-dt-error">🐢 {t('Slow words')}</div>
          <div className="flex flex-wrap gap-1.5">
            {slow.map((w) => <Chip key={w} word={w} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CoreFactor = ({ label, value }: { label: string; value: string | number }) => (
  <span className="inline-flex flex-col items-center leading-[1.2]">
    <span className="dt-tabular text-base text-dt-text font-semibold">{value}</span>
    <span className="text-[9.5px] tracking-[0.06em] uppercase text-dt-text-3">{label}</span>
  </span>
);

// ─── Ranking section ──────────────────────────────────────────────────────────
const SnippetRankingSection = ({ snippetId, myCore }: { snippetId: number; myCore: number }) => {
  const t = useT();
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnippetRanking(snippetId)
      .then(res => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [snippetId]);

  return (
    <div style={{ padding: '40px 0 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="dt-label" style={{ marginBottom: 4 }}>{t('Leaderboard')}</div>
        <div className="dt-h2 m-0">{t('Snippet ranking')}</div>
        <div className="dt-caption" style={{ marginTop: 6 }}>{t('Best CORE per player — top 50')}</div>
      </div>

      {loading ? (
        <div className="dt-card" style={{ padding: 32, textAlign: 'center', color: 'var(--dt-text-3)' }}>
          {t('Loading ranking…')}
        </div>
      ) : items.length === 0 ? (
        <div className="dt-card" style={{ padding: 32, textAlign: 'center', color: 'var(--dt-text-3)' }}>
          {t('No rankings yet — be the first!')}
        </div>
      ) : (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((item, i) => {
            const isMe = item.core === myCore && i === 0;
            return (
              <div key={item.userId} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 100px 100px 80px', gap: 12,
                alignItems: 'center', padding: '11px 18px',
                background: isMe ? 'color-mix(in oklab, var(--dt-primary) 7%, transparent)' : 'transparent',
                boxShadow: i > 0 ? 'inset 0 1px 0 var(--dt-border)' : 'none',
              }}>
                <span className="dt-mono tabular-nums" style={{
                  fontSize: 14, fontWeight: item.rank <= 3 ? 700 : 500,
                  color: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : 'var(--dt-text-2)',
                }}>
                  #{item.rank}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar handle={item.username} hue={(item.username.charCodeAt(0) * 7) % 360} size={24} />
                  <span className="dt-mono" style={{ fontSize: 13, color: 'var(--dt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.username}
                  </span>
                </div>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--dt-primary)' }}>
                  {item.core} <span style={{ fontSize: 10, color: 'var(--dt-text-3)', fontWeight: 400 }}>CORE</span>
                </span>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 13, color: 'var(--dt-text-2)' }}>
                  {item.wpm} <span style={{ fontSize: 10 }}>WPM</span>
                </span>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 13, color: 'var(--dt-text-3)' }}>
                  {item.accuracy.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Result ───────────────────────────────────────────────────────────────────
interface SoloResultProps {
  result: TypingResult; track: SoloTrack | null; diff: string;
  onNext: () => void; onChangeSettings: () => void; snippet: string;
  apiSnippetId?: number;
}

const SoloResult = ({ result, track, diff, onNext, onChangeSettings, snippet, apiSnippetId }: SoloResultProps) => {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const rankRef = useRef<HTMLDivElement>(null);

  const snipId = track?.id || 'unknown';
  const realDiff = track?.difficulty || diff;
  const { core, nWpm, diffW, lenW } = computeCore(result.wpm, result.acc, realDiff, snippet.length);

  const prevBest = readBestMap()[snipId] || 0;
  const isNewBest = core > prevBest;
  const prevTotal = useMemo(() => totalCoreSum(), [snipId]); // eslint-disable-line react-hooks/exhaustive-deps
  const delta = isNewBest ? core - prevBest : 0;
  useEffect(() => { writeBest(snipId, core); }, [snipId, core]);

  const scrollToRanking = () => {
    rankRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={scrollRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'var(--dt-bg)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      {/* ── Stats section ── */}
      <div ref={statsRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '32px max(24px, calc((100vw - 900px) / 2))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="dt-label" style={{ marginBottom: 4 }}>Result</div>
            <div className="dt-h2 m-0">{t('Run complete.')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
            <button className="dt-btn dt-btn-primary" onClick={onNext}><IconRefresh size={16} /> {t('New snippet')}</button>
          </div>
        </div>

        {/* CORE hero */}
        <div className="dt-card p-0 overflow-hidden mb-3">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
            <div style={{ padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="dt-label" style={{ marginBottom: 8 }}>{t('CORE this run')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span className="dt-mono dt-tabular" style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, color: 'var(--dt-primary)' }}>{core}</span>
                {isNewBest ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999,
                    fontSize: 13, fontWeight: 700, color: 'var(--dt-primary)',
                    background: 'color-mix(in oklab, var(--dt-primary) 16%, transparent)',
                    boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 45%, transparent)',
                  }}>🎉 {t('New best!')}</span>
                ) : (
                  <span className="dt-caption" style={{ maxWidth: 180 }}>
                    {t('Best on this snippet')}: <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>{prevBest}</span>
                  </span>
                )}
              </div>
              <div className="dt-mono" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap', color: 'var(--dt-text-2)' }}>
                <CoreFactor label="nWPM" value={nWpm} />
                <span style={{ color: 'var(--dt-text-3)' }}>×</span>
                <CoreFactor label={t(realDiff.toLowerCase() === 'easy' ? 'Easy' : realDiff.toLowerCase() === 'hard' ? 'Hard' : 'Medium')} value={diffW.toFixed(1)} />
                <span style={{ color: 'var(--dt-text-3)' }}>×</span>
                <CoreFactor label={t('Length')} value={lenW.toFixed(2)} />
              </div>
            </div>
            <div style={{ background: 'var(--dt-border)' }} />
            <div style={{ padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <div className="dt-label">{t('Total CORE')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span className="dt-mono dt-tabular" style={{ fontSize: 32, fontWeight: 700, color: 'var(--dt-text)' }}>
                  {(prevTotal + delta).toLocaleString()}
                </span>
                {isNewBest ? (
                  <span className="dt-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--dt-success)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <IconArrowUp size={15} /> +{delta}
                  </span>
                ) : (
                  <span className="dt-caption">+0</span>
                )}
              </div>
              <p className="dt-caption" style={{ marginTop: 6, lineHeight: 1.5, maxWidth: 280 }}>
                {isNewBest
                  ? t('This beat your previous best on this snippet, so it lifted your Total CORE.')
                  : t('Only your best run per snippet counts. This run is saved to history but did not change Total CORE.')}
              </p>
            </div>
          </div>
        </div>

        {/* Secondary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard label={t('WPM')} value={result.wpm} />
          <StatCard label={t('Raw WPM')} value={Math.round(result.wpm / Math.max(0.5, result.acc / 100))} />
          <StatCard label={t('Accuracy')} value={result.acc.toFixed(1)} unit="%" sub={`${result.errors} ${t('mistakes corrected')}`} />
          <StatCard label={t('Longest combo')} value={soloDerived(result, snippet).combo} unit="x" />
          <StatCard label={t('Time')} value={(result.elapsed / 1000).toFixed(1)} unit="s" sub={`${snippet.length} ${t('chars typed')}`} />
        </div>

        <SoloWpmGraph result={result} snippet={snippet} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <MistypedLetters result={result} snippet={snippet} />
          <WordChips result={result} snippet={snippet} />
        </div>

        {/* Scroll hint to ranking */}
        {apiSnippetId && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button onClick={scrollToRanking} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: 'transparent', border: 0, cursor: 'default', color: 'var(--dt-text-3)',
              padding: '8px 20px', borderRadius: 12,
              transition: 'color 140ms',
            }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--dt-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--dt-text-3)')}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t('Snippet ranking')}</span>
              <IconArrowDown size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ── Ranking section ── */}
      {apiSnippetId && (
        <div ref={rankRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 max(24px, calc((100vw - 900px) / 2)) 32px' }}>
          <SnippetRankingSection snippetId={apiSnippetId} myCore={core} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 'auto', paddingTop: 32 }}>
            <button onClick={scrollToStats} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 0,
              cursor: 'default', color: 'var(--dt-text-3)', padding: '8px 16px',
            }}>
              <IconArrowUp size={16} /> {t('Back to stats')}
            </button>
            <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
            <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}>
              <IconArrowRight size={16} /> {t('Try another snippet')}
            </button>
          </div>
        </div>
      )}

      {/* No ranking (local track) — just action buttons at bottom */}
      {!apiSnippetId && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 24px 48px' }}>
          <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change language / difficulty')}</button>
          <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}>
            <IconArrowRight size={16} /> {t('Try another snippet')}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Solo = () => {
  const [searchParams] = useSearchParams();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [lang, setLang] = useState('javascript');
  const [phase, setPhase] = useState<Phase>('setup');
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [track, setTrack] = useState<SoloTrack | null>(null);
  const [apiSnippetId, setApiSnippetId] = useState<number | undefined>(undefined);
  const [loadingSnippet, setLoadingSnippet] = useState(false);

  // Load snippet from URL param on mount
  useEffect(() => {
    const idParam = searchParams.get('snippetId');
    if (!idParam) return;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return;

    setLoadingSnippet(true);
    getPublicSnippet(id)
      .then(snippet => {
        const langKey = toLangKey(snippet.language);
        const soloTrack: SoloTrack = {
          id: String(snippet.id),
          lang: langKey,
          difficulty: snippet.difficulty.toLowerCase() as SoloTrack['difficulty'],
          title: snippet.title,
          avgWpm: snippet.avgWpm,
          code: snippet.content,
        };
        setTrack(soloTrack);
        setApiSnippetId(snippet.id);
        setLang(langKey);
        setResult(null);
        setResetKey(k => k + 1);
        setPhase('typing');
      })
      .catch(() => {
        // fall back to setup
        setPhase('setup');
      })
      .finally(() => setLoadingSnippet(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snippet = track ? track.code : '';
  const diff = track ? track.difficulty : 'medium';
  const realLang = track ? track.lang : lang;

  const fetchAndStart = async (l: string) => {
    setLoadingSnippet(true);
    try {
      const apiLang = UI_TO_API_LANG[l];
      const s = await getRandomSnippet(apiLang);
      const langKey = toLangKey(s.language);
      const soloTrack: SoloTrack = {
        id: String(s.id),
        lang: langKey,
        difficulty: s.difficulty.toLowerCase() as SoloTrack['difficulty'],
        title: s.title,
        avgWpm: Number(s.avgWpm),
        code: s.content,
      };
      setApiSnippetId(s.id);
      setTrack(soloTrack);
      setResult(null);
      setResetKey((k) => k + 1);
      setPhase('typing');
    } catch {
      // API 실패 시 setup 유지 — 오류는 버튼 상태로 표시 안 함
    } finally {
      setLoadingSnippet(false);
    }
  };
  const start = () => fetchAndStart(lang);

  const onFinish = async (r: TypingResult) => {
    setResult(r);
    setPhase('result');

    if (isLoggedIn && apiSnippetId) {
      try {
        await saveSnippetResult({
          snippetId: apiSnippetId,
          wpm: r.wpm,
          rawWpm: r.rawWpm,
          accuracy: r.acc,
          durationSec: Math.round(r.elapsed / 1000),
          typos: r.typos ?? [],
          replayData: r.replayData ?? [],
        });
      } catch {
        // save failed silently
      }
    }
  };

  const next = () => fetchAndStart(lang);

  if (loadingSnippet) {
    return (
      <div className="dt-page-narrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="dt-caption" style={{ fontSize: 15 }}>Loading snippet…</div>
      </div>
    );
  }

  return (
    <div className="dt-page-narrow">
      {phase === 'setup' && (
        <SoloSetup lang={lang} setLang={setLang} onStart={start} />
      )}
      {phase === 'typing' && track && (
        <SoloTyping
          snippet={snippet} lang={lang} diff={diff} progress={progress} setProgress={setProgress}
          onFinish={onFinish} resetKey={resetKey}
          onReset={() => setResetKey((k) => k + 1)}
          onChangeSettings={() => { setApiSnippetId(undefined); setPhase('setup'); }}
          realLang={realLang}
        />
      )}
      {phase === 'result' && result && (
        <SoloResult
          result={result} track={track} diff={diff}
          onNext={next}
          onChangeSettings={() => { setApiSnippetId(undefined); setPhase('setup'); }}
          snippet={snippet}
          apiSnippetId={apiSnippetId}
        />
      )}
    </div>
  );
};

export default Solo;
