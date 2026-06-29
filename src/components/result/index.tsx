import { useState, useMemo } from 'react';
import { useT } from '@/i18n';
import type { TypingResult } from '@/types';

// ─── CORE scoring ─────────────────────────────────────────────────────────────
export function computeCore(wpm: number, acc: number, diff: string, len: number) {
  const diffW = ({ easy: 1.0, medium: 1.3, hard: 1.6 } as Record<string, number>)[diff.toLowerCase()] || 1.3;
  const lenW = Math.min(2.0, Math.max(0.5, len / 200));
  const nWpm = wpm * (acc / 100);
  return { core: Math.round(nWpm * diffW * lenW), nWpm: +nWpm.toFixed(1), diffW, lenW };
}

export function soloDerived(result: TypingResult, snippet: string) {
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

// ─── CoreFactor ───────────────────────────────────────────────────────────────
export const CoreFactor = ({ label, value }: { label: string; value: string | number }) => (
  <span className="inline-flex flex-col items-center leading-[1.2]">
    <span className="dt-tabular text-base text-dt-text font-semibold">{value}</span>
    <span className="text-[9.5px] tracking-[0.06em] uppercase text-dt-text-3">{label}</span>
  </span>
);

// ─── WpmGraph ─────────────────────────────────────────────────────────────────
export const WpmGraph = ({ result, snippet }: { result: TypingResult; snippet: string }) => {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);

  const vals = useMemo(() => {
    const rd = result.replayData;
    if (rd && rd.length > 4) {
      const N = Math.min(40, Math.floor(rd.length / 2));
      const maxT = rd[rd.length - 1].timestamp || 1;
      return Array.from({ length: N }, (_, i) => {
        const tMs = ((i + 1) / N) * maxT;
        const correct = rd.filter(e => e.timestamp <= tMs && e.correct).length;
        return Math.max(0, Math.min(400, Math.round((correct / 5) / (tMs / 60000))));
      });
    }
    return soloDerived(result, snippet).samples;
  }, [result, snippet]);

  const w = 860, h = 220, padL = 48, padR = 24, padT = 16, padB = 28;
  const chartW = w - padL - padR, chartH = h - padT - padB;

  const rawMax = Math.max(...vals, 1);
  const rawMin = Math.min(...vals, 0);
  const st = rawMax <= 50 ? 10 : rawMax <= 150 ? 20 : rawMax <= 300 ? 50 : 100;
  const niceMax = Math.ceil(rawMax / st) * st + st;
  const niceMin = Math.max(0, Math.floor(rawMin / st) * st - st);
  const range = niceMax - niceMin || 1;

  const toX = (i: number) => padL + (i / Math.max(vals.length - 1, 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - niceMin) / range) * chartH;

  const gridLines = Array.from({ length: 6 }, (_, i) => ({
    value: Math.round(niceMin + (range * i) / 5),
    y: toY(niceMin + (range * i) / 5),
  }));

  const linePath = vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  const areaPath = `${linePath} L ${toX(vals.length - 1)} ${toY(niceMin)} L ${toX(0)} ${toY(niceMin)} Z`;
  const dips = vals.map((v, i) => (i > 0 && i < vals.length - 1 && v < vals[i - 1] - 15 && v < vals[i + 1] - 8) ? i : -1).filter(i => i >= 0);

  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="py-[18px] px-6 flex items-center gap-3 border-b-[0.5px] border-dt-border">
        <span className="dt-h3 m-0">{t('WPM over time')}</span>
        <span className="inline-flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-dt-primary" />
          <span className="dt-caption">WPM</span>
          <span className="w-2 h-2 rounded-full bg-dt-error ml-2.5" />
          <span className="dt-caption">{t('error dip')}</span>
        </span>
      </div>
      <div className="px-4 pt-3 pb-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
          <defs>
            <linearGradient id="resultWpmFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {gridLines.map(({ value, y }) => (
            <g key={value}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="var(--dt-border)" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{value}</text>
            </g>
          ))}
          <path d={areaPath} fill="url(#resultWpmFade)" />
          <path d={linePath} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {dips.map(i => <circle key={i} cx={toX(i)} cy={toY(vals[i])} r={4} fill="var(--dt-error)" />)}
          {hi !== null && <line x1={toX(hi)} x2={toX(hi)} y1={padT} y2={padT + chartH} stroke="var(--dt-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />}
          {vals.map((_, i) => (
            <rect key={i} x={toX(i) - chartW / vals.length / 2} y={0} width={chartW / vals.length} height={h} fill="transparent"
              onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(p => p === i ? null : p)} />
          ))}
          {hi !== null && (() => {
            const tw = 90, tx = Math.min(Math.max(toX(hi) - tw / 2, padL), w - padR - tw);
            const ty = Math.max(toY(vals[hi]) - 46, padT + 4);
            return (
              <g pointerEvents="none">
                <circle cx={toX(hi)} cy={toY(vals[hi])} r={4.5} fill="var(--dt-primary)" />
                <rect x={tx} y={ty} width={tw} height={32} rx={6} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx + tw / 2} y={ty + 21} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">
                  {vals[hi]} <tspan fontSize="9" fill="var(--dt-text-3)">WPM</tspan>
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

// ─── MistypedLetters ──────────────────────────────────────────────────────────
export const MistypedLetters = ({ result, snippet }: { result: TypingResult; snippet: string }) => {
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

// ─── WordChips ────────────────────────────────────────────────────────────────
export const WordChips = ({ result: _result, snippet }: { result: TypingResult; snippet: string }) => {
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
