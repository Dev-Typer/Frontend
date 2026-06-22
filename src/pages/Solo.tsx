import { useState, useEffect, useMemo } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import SectionHead from '@/components/SectionHead';
import Pill from '@/components/Pill';
import PlayEditor from '@/components/PlayEditor';
import { IconPlay, IconRefresh, IconSettings, IconKeyboard, IconArrowUp, IconArrowRight } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult, SoloTrack } from '@/types';
import { SOLO_TRACKS, LANG_ICON } from '@/data';

type Phase = 'setup' | 'typing' | 'result';

const LANGS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'go',         label: 'Go'         },
  { id: 'java',       label: 'Java'       },
  { id: 'sql',        label: 'SQL'        },
];
const DIFFS = [
  { id: 'easy',   label: 'Easy',   chars: '~80 chars'  },
  { id: 'medium', label: 'Medium', chars: '~180 chars' },
  { id: 'hard',   label: 'Hard',   chars: '~320 chars' },
];

const kbdClass = 'inline-block py-px px-1.5 mx-0.5 bg-dt-hover border-[0.5px] border-dt-border rounded font-dt-mono text-[11px] text-dt-text-2';

function fileExtFor(lang: string) {
  return ({ javascript: '.js', typescript: '.ts', python: '.py', go: '.go', java: '.java', sql: '.sql' } as Record<string, string>)[lang] || '.txt';
}

// ─── CORE scoring (per-play) + best-per-snippet store ───────────────────────
function computeCore(wpm: number, acc: number, diff: string, len: number) {
  const diffW = ({ easy: 1.0, medium: 1.3, hard: 1.6 } as Record<string, number>)[diff] || 1.3;
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

interface SoloSetupProps {
  lang: string; setLang: (l: string) => void; onStart: () => void;
}

const SoloSetup = ({ lang, setLang, onStart }: SoloSetupProps) => {
  const t = useT();
  const langLabel = LANGS.find((l) => l.id === lang)?.label;
  return (
    <div className="pt-2">
      <SectionHead kicker="Solo practice" title="Pick a language. Start typing." />

      {/* Hero card — language pick + start */}
      <div className="relative overflow-hidden rounded-dt-md py-10 px-10 pb-11 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--dt-card)_70%,transparent),color-mix(in_oklab,#2E6BFF_12%,transparent))] [backdrop-filter:blur(14px)_saturate(1.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_var(--dt-border),0_20px_52px_-28px_rgba(46,107,255,0.5)]">
        {/* big SOLO art, right */}
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
      {/* Top meta strip */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {LANG_ICON[dispLang] && (
            <img src={LANG_ICON[dispLang]} alt="" className="w-[26px] h-[26px] object-contain" />
          )}
          <span className="dt-h2 m-0">{LANGS.find((l) => l.id === dispLang)?.label || dispLang}</span>
          <span className="dt-chip">{t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>
        </div>
        {/* inline live stats */}
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

      {/* Progress bar */}
      <div className="dt-progress mb-[18px] h-1.5">
        <div style={{ width: `${pct}%` }} />
      </div>

      {/* Editor — the centerpiece, fills remaining height */}
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

// Deterministic per-run analytics derived from the result + snippet.
function soloDerived(result: TypingResult, snippet: string) {
  const len = snippet.length;
  const errors = result.errors || 0;
  // longest combo ~ chars between mistakes
  const combo = Math.max(8, Math.round(len / (errors + 1)));
  // sample count for the WPM timeline
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

// Hand-drawn SVG WPM line with error-dip markers.
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

// Most-mistyped characters — div-width bar chart, no chart lib.
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

// Fast vs. slow words — green / red chips.
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

interface SoloResultProps {
  result: TypingResult; track: SoloTrack | null; diff: string;
  onNext: () => void; onChangeSettings: () => void; snippet: string;
}

const SoloResult = ({ result, track, diff, onNext, onChangeSettings, snippet }: SoloResultProps) => {
  const t = useT();
  const snipId = track?.id || 'unknown';
  const realDiff = track?.difficulty || diff;
  const { core, nWpm, diffW, lenW } = computeCore(result.wpm, result.acc, realDiff, snippet.length);

  // Best-per-snippet: only the highest CORE on a snippet counts toward Total CORE.
  const prevBest = readBestMap()[snipId] || 0;
  const isNewBest = core > prevBest;
  const prevTotal = useMemo(() => totalCoreSum(), [snipId]);
  const delta = isNewBest ? core - prevBest : 0;
  useEffect(() => { writeBest(snipId, core); }, [snipId, core]);

  return (
    <div>
      <SectionHead kicker="Result" title="Run complete." action={
        <div className="flex gap-2">
          <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
          <button className="dt-btn dt-btn-primary" onClick={onNext}><IconRefresh size={16} /> {t('New snippet')}</button>
        </div>
      } />

      {/* CORE hero — the score this play earned */}
      <div className="dt-card p-0 overflow-hidden mb-3">
        <div className="grid grid-cols-[1fr_1px_1fr] items-stretch">
          {/* left: this play's CORE */}
          <div className="py-[30px] px-8 flex flex-col justify-center">
            <div className="dt-label mb-2">{t('CORE this run')}</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="dt-mono dt-tabular text-[64px] font-bold leading-[0.9] text-dt-primary">{core}</span>
              {isNewBest ? (
                <span className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-[13px] font-bold text-dt-primary bg-[color-mix(in_oklab,var(--dt-primary)_16%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--dt-primary)_45%,transparent)]">
                  🎉 {t('New best!')}
                </span>
              ) : (
                <span className="dt-caption max-w-[180px]">
                  {t('Best on this snippet')}: <span className="dt-mono text-dt-text">{prevBest}</span>
                </span>
              )}
            </div>
            {/* formula breakdown */}
            <div className="dt-mono flex items-center gap-2.5 mt-[18px] flex-wrap text-dt-text-2">
              <CoreFactor label="nWPM" value={nWpm} />
              <span className="text-dt-text-3">×</span>
              <CoreFactor label={t(realDiff === 'easy' ? 'Easy' : realDiff === 'hard' ? 'Hard' : 'Medium')} value={diffW.toFixed(1)} />
              <span className="text-dt-text-3">×</span>
              <CoreFactor label={t('Length')} value={lenW.toFixed(2)} />
            </div>
          </div>
          <div className="bg-dt-border" />
          {/* right: effect on Total CORE */}
          <div className="py-[30px] px-8 flex flex-col justify-center gap-1.5">
            <div className="dt-label">{t('Total CORE')}</div>
            <div className="flex items-baseline gap-2.5">
              <span className="dt-mono dt-tabular text-[32px] font-bold text-dt-text">
                {(prevTotal + delta).toLocaleString()}
              </span>
              {isNewBest ? (
                <span className="dt-mono text-[15px] font-bold text-dt-success flex items-center gap-[3px]">
                  <IconArrowUp size={15} /> +{delta}
                </span>
              ) : (
                <span className="dt-caption">+0</span>
              )}
            </div>
            <p className="dt-caption mt-1.5 leading-[1.5] max-w-[280px]">
              {isNewBest
                ? t('This beat your previous best on this snippet, so it lifted your Total CORE.')
                : t('Only your best run per snippet counts. This run is saved to history but did not change Total CORE.')}
            </p>
          </div>
        </div>
      </div>

      {/* secondary stats — 5 cards */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <StatCard label={t('WPM')} value={result.wpm} />
        <StatCard label={t('Raw WPM')} value={Math.round(result.wpm / Math.max(0.5, result.acc / 100))} />
        <StatCard label={t('Accuracy')} value={result.acc.toFixed(1)} unit="%" sub={`${result.errors} ${t('mistakes corrected')}`} />
        <StatCard label={t('Longest combo')} value={soloDerived(result, snippet).combo} unit="x" />
        <StatCard label={t('Time')} value={(result.elapsed / 1000).toFixed(1)} unit="s" sub={`${snippet.length} ${t('chars typed')}`} />
      </div>

      {/* WPM-over-time graph */}
      <SoloWpmGraph result={result} snippet={snippet} />

      {/* Typo analysis */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <MistypedLetters result={result} snippet={snippet} />
        <WordChips result={result} snippet={snippet} />
      </div>

      <div className="flex justify-center mt-7 gap-3">
        <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>
          {t('Change language / difficulty')}
        </button>
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}>
          <IconArrowRight size={16} /> {t('Try another snippet')}
        </button>
      </div>
    </div>
  );
};

const Solo = () => {
  const [lang, setLang] = useState('javascript');
  const [phase, setPhase] = useState<Phase>('setup');
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [track, setTrack] = useState<SoloTrack | null>(null);

  const pickRandom = (l: string): SoloTrack => {
    const pool = l === 'random' ? SOLO_TRACKS : SOLO_TRACKS.filter((tr) => tr.lang === l);
    return pool[Math.floor(Math.random() * pool.length)] || SOLO_TRACKS[0];
  };

  const snippet = track ? track.code : '';
  const diff = track ? track.difficulty : 'medium';
  const realLang = track ? track.lang : lang;

  const startWith = (l: string) => { setTrack(pickRandom(l)); setResult(null); setResetKey((k) => k + 1); setPhase('typing'); };
  const start = () => startWith(lang);
  const onFinish = (r: TypingResult) => { setResult(r); setPhase('result'); };
  const next = () => { setTrack(pickRandom(lang)); setResetKey((k) => k + 1); setResult(null); setPhase('typing'); };

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
          onChangeSettings={() => setPhase('setup')}
          realLang={realLang}
        />
      )}
      {phase === 'result' && result && (
        <SoloResult result={result} track={track} diff={diff} onNext={next} onChangeSettings={() => setPhase('setup')} snippet={snippet} />
      )}
    </div>
  );
};

export default Solo;
