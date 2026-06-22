import { useState, useMemo } from 'react';
import { useT } from '@/i18n';
import { ME, CHALLENGE_HISTORY, STREAK_STATS, LANG_ICON } from '@/data';
import Avatar from '@/components/Avatar';
import TierBadge from '@/components/TierBadge';
import { IconChevronDown } from '@/components/icons/Icons';
import type { StreakEntry } from '@/types';

// ─── Local dummy data ──────────────────────────────────────────────────────────
const BADGES = [
  { emoji: '⚡', name: '100 WPM 돌파',   color: '#57E5FF', earned: true  },
  { emoji: '🔥', name: '14일 연속',       color: '#FF7A3C', earned: true  },
  { emoji: '🌐', name: 'CORE 5K 돌파',   color: '#B93CFF', earned: true  },
  { emoji: '🎯', name: '정확도 99%',      color: '#3DD68C', earned: true  },
  { emoji: '🏆', name: '챌린지 Top 10',  color: '#FFD060', earned: true  },
  { emoji: '💎', name: 'CORE 8K 돌파',   color: '#5AA8FF', earned: false },
  { emoji: '🐍', name: 'Python 마스터',  color: '#3DD68C', earned: false },
  { emoji: '👑', name: '챌린지 1위',      color: '#FFD060', earned: false },
];

const CORE_HISTORY = ME.coreHistory;
const BEST_SNIPPETS = ME.bestSnippets;
const LANG_CORE = ME.byLang.map(l => ({
  lang: l.lang,
  core: l.core ?? 0,
  snippets: l.snippets ?? 0,
}));

// ─── Level helpers ────────────────────────────────────────────────────────────
function levelBg(lv: number): string {
  return ['rgba(255,255,255,0.04)','rgba(80,250,123,0.22)','rgba(80,250,123,0.40)','rgba(80,250,123,0.62)','rgba(80,250,123,0.85)'][lv];
}

// ─── Year grid builder ────────────────────────────────────────────────────────
function buildYear(year: number) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(Date.UTC(year, 0, 1));
  const end   = new Date(Date.UTC(year, 11, 31));
  const days: StreakEntry[] = [];
  let submittedCount = 0, dayCount = 0;
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const future = d > today;
    let submitted = false, wpm: number | null = null;
    if (!future) {
      dayCount++;
      const n = Math.floor(d.getTime() / 86400000);
      const s = Math.sin(n * 12.9898 + year * 3.17) * 43758.5453;
      submitted = (s - Math.floor(s)) > 0.4;
      if (submitted) { submittedCount++; wpm = 70 + Math.round(Math.abs(Math.sin(n * 0.7)) * 60); }
    }
    days.push({ date: iso, submitted, wpm, day: d.getUTCDay() });
  }
  const weeks: (StreakEntry | null)[][] = [];
  let cur: (StreakEntry | null)[] = Array.from({ length: 7 }, () => null);
  const firstDay = days[0].day;
  for (let p = 0; p < firstDay; p++) cur[p] = null;
  days.forEach(entry => {
    cur[entry.day] = entry;
    if (entry.day === 6) { weeks.push(cur); cur = Array.from({ length: 7 }, () => null); }
  });
  if (cur.some(c => c)) weeks.push(cur);
  const monthSpans: { month: number; week: number }[] = [];
  weeks.forEach((wk, wi) => {
    const firstReal = wk.find(c => c && !('padding' in c));
    if (!firstReal) return;
    const m = new Date(firstReal.date).getUTCMonth();
    const last = monthSpans[monthSpans.length - 1];
    if (!last || last.month !== m) monthSpans.push({ month: m, week: wi });
  });
  return { weeks, monthSpans, submittedCount, dayCount };
}

// ─── ProfileHeader ────────────────────────────────────────────────────────────
function ProfileHeader() {
  const t = useT();
  const me = ME;
  return (
    <div className="relative rounded-dt-md overflow-hidden" style={{ minHeight: 300 }}>
      {/* Banner background */}
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, color-mix(in oklab, hsl(${me.avatarHue}deg 60% 30%) 40%, #0B0E16) 0%, #0B0E16 100%)` }} />
      {/* Legibility scrims */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(7,12,31,0.15) 0%, rgba(7,12,31,0.05) 35%, rgba(7,12,31,0.9) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(7,12,31,0.6) 0%, transparent 50%)' }} />

      {/* Big CORE — bottom right */}
      <div className="absolute right-8 bottom-[26px] text-right z-[3]">
        <div className="dt-mono tabular-nums font-bold text-[76px] leading-[0.9] text-white"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
          {me.totalCore.toLocaleString()}
        </div>
        <div className="dt-label mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>CORE</div>
      </div>

      {/* Identity — bottom left */}
      <div className="absolute left-8 bottom-[26px] flex items-end gap-[18px] z-[3]">
        <div className="w-[84px] h-[84px] rounded-[18px] shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(16,26,45,0.6)', backdropFilter: 'blur(8px)', boxShadow: 'inset 0 0 0 2px var(--dt-primary), 0 8px 24px -8px rgba(0,0,0,0.6)' }}>
          <Avatar handle={me.handle} hue={me.avatarHue} size={72} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 dt-mono font-bold text-[38px] leading-none text-white"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            {me.handle}
          </h1>
          <div className="flex items-center gap-3">
            <TierBadge tier={me.tier} />
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {t('Joined')} {me.joined}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BadgesCard ───────────────────────────────────────────────────────────────
function BadgesCard() {
  const t = useT();
  const earned = BADGES.filter(b => b.earned).length;
  return (
    <div className="dt-card flex items-center gap-4 px-[18px] py-3 mt-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[15px]">🎖️</span>
        <span className="font-semibold text-[14px]">{t('Badges')}</span>
        <span className="dt-caption"><span className="dt-mono text-dt-primary">{earned}</span>/{BADGES.length}</span>
      </div>
      <div className="w-px self-stretch bg-dt-border" />
      <div className="flex gap-[10px] flex-wrap">
        {BADGES.map((b, i) => <BadgeMedal key={i} badge={b} />)}
      </div>
    </div>
  );
}

function BadgeMedal({ badge }: { badge: typeof BADGES[0] }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span
        className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[19px] cursor-default"
        style={{
          background: badge.earned ? `color-mix(in oklab, ${badge.color} 18%, transparent)` : 'var(--dt-hover)',
          boxShadow: badge.earned ? `inset 0 0 0 1.5px color-mix(in oklab, ${badge.color} 55%, transparent)` : 'inset 0 0 0 1px var(--dt-border)',
          filter: badge.earned ? 'none' : 'grayscale(1)',
          opacity: badge.earned ? 1 : 0.4,
        }}>
        {badge.emoji}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-3 py-[6px] rounded-lg text-[12px] font-semibold"
          style={{ background: 'var(--dt-card)', color: 'var(--dt-text)', boxShadow: '0 0 0 1px var(--dt-border), 0 8px 20px -8px rgba(0,0,0,0.6)' }}>
          {badge.name}
          {!badge.earned && <span className="text-dt-text-3 ml-[6px] font-normal">· 미획득</span>}
        </span>
      )}
    </span>
  );
}

// ─── StreakCard (year contribution grid) ──────────────────────────────────────
function ContributionCell({ cell, size }: { cell: StreakEntry | null; size: number }) {
  if (!cell) return <div style={{ width: size, height: size }} />;
  const lv = !cell.submitted ? 0 : !cell.wpm ? 1 : cell.wpm < 80 ? 2 : cell.wpm < 100 ? 3 : 4;
  const today = cell.date === new Date().toISOString().slice(0, 10);
  return (
    <div
      title={`${cell.date}${cell.wpm ? ` · ${cell.wpm} wpm` : ' · 미제출'}`}
      style={{
        width: size, height: size, background: levelBg(lv), borderRadius: 2, cursor: 'default',
        boxShadow: today ? 'inset 0 0 0 1px var(--dt-primary), 0 0 8px rgba(80,250,123,0.5)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
        transition: 'transform 100ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
    />
  );
}

function StreakCard() {
  const t = useT();
  const stats = STREAK_STATS;
  const YEARS = [2026, 2025, 2024];
  const [year, setYear] = useState(2026);
  const { weeks, monthSpans, submittedCount, dayCount } = useMemo(() => buildYear(year), [year]);
  const cell = 15, gap = 3;
  const col = cell + gap;
  const MONTHS = [t('Jan'),t('Feb'),t('Mar'),t('Apr'),t('May'),t('Jun'),t('Jul'),t('Aug'),t('Sep'),t('Oct'),t('Nov'),t('Dec')];

  return (
    <div className="dt-card mt-5 px-[22px] py-[18px] overflow-hidden relative">
      <div className="absolute top-[-40px] left-[-40px] w-[280px] h-[280px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,184,108,0.10), transparent 70%)' }} />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-[14px]">
        <span className="text-[26px] leading-none">🔥</span>
        <span className="dt-mono tabular-nums text-[30px] font-bold leading-none"
          style={{ color: 'var(--dt-warning)' }}>{stats.current}</span>
        <span className="dt-label text-dt-text-2">{t('day streak')}</span>
        <span className="dt-caption ml-[14px]">{submittedCount} / {dayCount} {t('days')}</span>
        <div className="ml-auto relative inline-flex items-center">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="dt-input dt-mono cursor-default"
            style={{ height: 22, minHeight: 22, lineHeight: '20px', padding: '0 20px 0 7px', borderRadius: 5, fontSize: 11, appearance: 'none', WebkitAppearance: 'none' }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="absolute right-2 pointer-events-none text-dt-text-3 flex">
            <IconChevronDown size={13} />
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="font-dt-mono">
        <div className="relative h-4 mb-1">
          {monthSpans.map((m, i) => (
            <span key={i} className="absolute text-[10px] text-dt-text-3 whitespace-nowrap"
              style={{ left: m.week * col }}>{MONTHS[m.month]}</span>
          ))}
        </div>
        <div className="flex" style={{ gap }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap }}>
              {week.map((cellData, di) => <ContributionCell key={di} cell={cellData} size={cell} />)}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-[6px] mt-3 text-[10px] text-dt-text-3">
          <span>{t('Less')}</span>
          {[0,1,2,3,4].map(lv => (
            <div key={lv} style={{ width: cell-1, height: cell-1, background: levelBg(lv), borderRadius: 2, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)' }} />
          ))}
          <span>{t('More')}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CoreDetailCard ────────────────────────────────────────────────────────────
function SnippetCoreChip({ snip }: { snip: typeof BEST_SNIPPETS[0] }) {
  const [show, setShow] = useState(false);
  const icon = LANG_ICON[snip.lang];
  const DIFF_COLOR: Record<string, string> = { easy: '#3DD68C', medium: '#57E5FF', hard: '#B93CFF' };
  const dc = DIFF_COLOR[snip.diff];
  return (
    <span className="relative inline-flex"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button className="inline-flex items-center justify-center w-[52px] h-[52px] rounded-[12px] border-0 p-0 cursor-default transition-[box-shadow,transform] duration-[120ms]"
        style={{
          background: 'var(--dt-hover)',
          boxShadow: show ? 'inset 0 0 0 1.5px color-mix(in oklab, var(--dt-primary) 55%, transparent)' : 'inset 0 0 0 1px var(--dt-border)',
          transform: show ? 'translateY(-2px)' : 'none',
        }}>
        {icon
          ? <img src={icon} alt={snip.lang} className="w-[30px] h-[30px] object-contain" />
          : <span className="dt-mono text-[13px] text-dt-text">{snip.lang.slice(0, 2)}</span>}
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 z-[200] w-[240px] rounded-[12px] overflow-hidden text-left"
          style={{ background: 'var(--dt-card)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px var(--dt-border), 0 20px 50px -16px rgba(0,0,0,0.7)', animation: 'dt-rise 140ms ease-out' }}>
          <div className="flex items-center gap-[9px] px-[15px] py-[13px] shadow-[inset_0_-1px_0_var(--dt-border)]">
            {icon && <img src={icon} alt="" className="w-[18px] h-[18px] object-contain" />}
            <span className="dt-mono text-[14px] text-dt-text truncate">{snip.title}</span>
          </div>
          <div className="p-[13px_15px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold px-[9px] py-[3px] rounded-[6px]"
                style={{ color: dc, background: `color-mix(in oklab, ${dc} 14%, transparent)` }}>
                {snip.diff === 'easy' ? 'Easy' : snip.diff === 'medium' ? 'Medium' : 'Hard'}
              </span>
              <span className="dt-mono tabular-nums text-[14px] font-semibold text-dt-primary">
                {snip.core} <span className="text-[10px] text-dt-text-3">CORE</span>
              </span>
            </div>
            <div className="flex items-baseline gap-[7px]">
              <span className="dt-caption">Snippet rank</span>
              <span className="dt-mono tabular-nums text-[15px] text-dt-text">#{snip.rank}</span>
              <span className="dt-caption">/ {snip.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

function CoreDetailCard() {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const sorted = [...BEST_SNIPPETS].sort((a, b) => b.core - a.core);
  const CAP = 10;
  const shown = expanded ? sorted : sorted.slice(0, CAP);
  const rest = sorted.length - CAP;
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">CORE</span>
          <span className="dt-caption">{t('Sum of your best CORE per snippet')}</span>
        </div>
        <div className="flex items-baseline gap-[6px]">
          <span className="dt-mono tabular-nums text-[30px] font-bold text-dt-primary">{ME.totalCore.toLocaleString()}</span>
          <span className="dt-label text-dt-text-3">· {ME.uniqueSnippets} {t('snippets')}</span>
        </div>
      </div>
      <div className="px-6 py-4 pb-[18px]">
        <div className="dt-label mb-3">{t('Top snippets by CORE')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10, justifyItems: 'center' }}>
          {shown.map((s, i) => <SnippetCoreChip key={i} snip={s} />)}
        </div>
        {rest > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-[14px] w-full py-[9px] rounded-[10px] border-0 cursor-default font-sans text-[12.5px] font-semibold flex items-center justify-center gap-[6px]"
            style={{ background: 'var(--dt-hover)', color: 'var(--dt-text-2)', boxShadow: 'inset 0 0 0 1px var(--dt-border)' }}>
            {expanded ? t('Show less') : `+${rest} ${t('more')}`}
            <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
              <IconChevronDown size={14} />
            </span>
          </button>
        )}
      </div>
      <div className="flex gap-7 px-6 py-[14px] border-t border-dt-border/50">
        <div className="flex flex-col gap-[2px]">
          <span className="dt-label">{t('Global rank')}</span>
          <span className="dt-mono tabular-nums text-[18px] text-dt-text">#{ME.globalRank}</span>
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="dt-label">JavaScript {t('rank')}</span>
          <span className="dt-mono tabular-nums text-[18px] text-dt-text">#{ME.langRank}</span>
        </div>
        <div className="flex flex-col gap-[2px] ml-auto items-end justify-center">
          <span className="dt-caption text-right max-w-[230px] leading-[1.45]">
            {t('Only your best run per snippet counts — replay anytime, it stays in history.')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── LanguageStatsCard ────────────────────────────────────────────────────────
function LanguageStatsCard() {
  const t = useT();
  const maxCore = Math.max(...LANG_CORE.map(l => l.core));
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="px-6 py-5 border-b border-dt-border/50">
        <span className="dt-h3 m-0">{t('CORE by language')}</span>
        <div className="dt-caption mt-[3px]">{t('Sum of your best CORE per snippet')}</div>
      </div>
      <div className="py-3">
        {LANG_CORE.map(l => (
          <div key={l.lang} className="grid items-center gap-4 px-6 py-[10px]"
            style={{ gridTemplateColumns: '132px 1fr 72px 60px' }}>
            <span className="flex items-center gap-[9px] min-w-0">
              {LANG_ICON[l.lang.toLowerCase()] && (
                <img src={LANG_ICON[l.lang.toLowerCase()]} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />
              )}
              <span className="dt-body-sm truncate">{l.lang}</span>
            </span>
            <div className="h-[6px] bg-dt-hover rounded-full overflow-hidden">
              <div style={{ width: `${(l.core / maxCore) * 100}%`, height: '100%', background: 'var(--dt-primary)', borderRadius: 999 }} />
            </div>
            <span className="dt-mono tabular-nums text-right text-[14px] font-semibold text-dt-primary">{l.core}</span>
            <span className="dt-mono tabular-nums dt-caption text-right" title={t('Snippets')}>{l.snippets}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CoreGrowthCard ───────────────────────────────────────────────────────────
function CoreGrowthCard() {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const data = CORE_HISTORY;
  const vals = data.map(d => d.core);
  const max = Math.max(...vals);
  const w = 640, h = 200, pad = 12, base = h - 22;
  const xs = data.map((_, i) => (i / (data.length - 1)) * (w - 2 * pad) + pad);
  const ys = vals.map(v => base - (v / (max || 1)) * (base - pad));
  const line = data.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = `${line} L ${xs[xs.length - 1]} ${base} L ${xs[0]} ${base} Z`;
  const gain = vals[vals.length - 1] - vals[0];
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">{t('CORE growth')}</span>
          <span className="dt-caption">{t('Last 6 months')}</span>
        </div>
        <div className="flex items-baseline gap-[6px]">
          <span className="dt-mono tabular-nums text-[16px] text-dt-primary">+{gain.toLocaleString()}</span>
          <span className="dt-caption">CORE</span>
        </div>
      </div>
      <div className="px-6 py-[18px] pb-[10px]">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
          <defs>
            <linearGradient id="coreFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0,1,2,3].map(i => (
            <line key={i} x1={0} x2={w} y1={(i+1)*base/4} y2={(i+1)*base/4} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.5" />
          ))}
          <path d={area} fill="url(#coreFade)" />
          <path d={line} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hi !== null && <line x1={xs[hi]} x2={xs[hi]} y1={pad-6} y2={base} stroke="var(--dt-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={xs[i]} cy={ys[i]} r={hi === i ? 6 : i === data.length - 1 ? 5 : 3} fill="var(--dt-primary)" />
              <text x={xs[i]} y={h - 4} textAnchor="middle" fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{t(d.label)}</text>
              <rect x={xs[i] - 22} y={0} width={44} height={base} fill="transparent"
                onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(p => p === i ? null : p)} />
            </g>
          ))}
          {hi !== null && (() => {
            const prev = hi > 0 ? vals[hi] - vals[hi - 1] : null;
            const tw = 116, tx = Math.min(Math.max(xs[hi] - tw/2, 4), w - tw - 4), ty = Math.max(ys[hi] - 64, 6);
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={tw} height={52} rx={8} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx+12} y={ty+20} fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{t(data[hi].label)}</text>
                <text x={tx+12} y={ty+40} fontSize="15" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">{vals[hi].toLocaleString()} <tspan fontSize="9" fill="var(--dt-text-3)">CORE</tspan></text>
                {prev !== null && <text x={tx+tw-12} y={ty+40} textAnchor="end" fontSize="11" fill="#3DD68C" fontFamily="var(--dt-font-mono)">+{prev}</text>}
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ─── LanguageRadarCard ────────────────────────────────────────────────────────
function LanguageRadarCard() {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const langs = LANG_CORE.slice(0, 10);
  const maxCore = Math.max(...langs.map(l => l.core));
  const cx = 150, cy = 150, R = 110;
  const n = langs.length;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, r: number): [number, number] => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = (r: number) => langs.map((_, i) => pt(i, r * R).join(',')).join(' ');
  const dataPoly = langs.map((l, i) => pt(i, (l.core / maxCore) * R).join(',')).join(' ');
  const top = langs.reduce((a, b) => b.core > a.core ? b : a, langs[0]);
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">{t('Language focus')}</span>
          <span className="dt-caption">{t('CORE distribution')}</span>
        </div>
        <span className="inline-flex items-center gap-[7px] text-[12.5px] text-dt-text-2">
          {LANG_ICON[top.lang.toLowerCase()] && <img src={LANG_ICON[top.lang.toLowerCase()]} alt="" className="w-4 h-4 object-contain" />}
          {top.lang}
        </span>
      </div>
      <div className="p-4 flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[320px] h-auto">
          {rings.map((r, i) => <polygon key={i} points={polygon(r)} fill="none" stroke="var(--dt-border)" strokeWidth="0.75" opacity="0.7" />)}
          {langs.map((_, i) => {
            const [x, y] = pt(i, R);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.6" />;
          })}
          <polygon points={dataPoly} fill="color-mix(in oklab, var(--dt-primary) 22%, transparent)" stroke="var(--dt-primary)" strokeWidth="2" strokeLinejoin="round" />
          {langs.map((l, i) => {
            const [x, y] = pt(i, (l.core / maxCore) * R);
            return <circle key={i} cx={x} cy={y} r={hi === i ? 5 : 3} fill="var(--dt-primary)" />;
          })}
          {langs.map((l, i) => {
            const [lx, ly] = pt(i, R + 18);
            const icon = LANG_ICON[l.lang.toLowerCase()];
            return icon
              ? <image key={i} href={icon} x={lx - 9} y={ly - 9} width="18" height="18" opacity={hi === null || hi === i ? 1 : 0.4} />
              : <text key={i} x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{l.lang.slice(0, 2)}</text>;
          })}
          {langs.map((l, i) => {
            const [x, y] = pt(i, (l.core / maxCore) * R);
            return <circle key={i} cx={x} cy={y} r="14" fill="transparent"
              onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(p => p === i ? null : p)} />;
          })}
          {hi !== null && (() => {
            const l = langs[hi];
            const tw = 132, tx = Math.min(Math.max(cx - tw/2, 4), 300 - tw - 4), ty = 8;
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={tw} height={46} rx={8} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx+12} y={ty+19} fontSize="12" fill="var(--dt-text)" fontFamily="var(--dt-font-mono)">{l.lang}</text>
                <text x={tx+12} y={ty+36} fontSize="14" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">{l.core.toLocaleString()} <tspan fontSize="9" fill="var(--dt-text-3)">CORE</tspan></text>
                <text x={tx+tw-12} y={ty+36} textAnchor="end" fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{l.snippets} {t('snippets')}</text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ─── WpmTrendCard ─────────────────────────────────────────────────────────────
function WpmTrendCard() {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const data = [...CHALLENGE_HISTORY].reverse();
  if (data.length < 2) return null;
  const vals = data.map(d => d.wpm);
  const min = Math.min(...vals) - 6, max = Math.max(...vals) + 6;
  const w = 980, h = 200, pad = 14, base = h - 22;
  const xs = data.map((_, i) => (i / (data.length - 1)) * (w - 2 * pad) + pad);
  const ys = vals.map(v => base - ((v - min) / (max - min || 1)) * (base - pad));
  const line = data.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = `${line} L ${xs[xs.length - 1]} ${base} L ${xs[0]} ${base} Z`;
  const best = Math.max(...vals);
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">{t('WPM trend')}</span>
          <span className="dt-caption">{t('Daily challenge results')}</span>
        </div>
        <div className="flex items-baseline gap-[6px]">
          <span className="dt-mono tabular-nums text-[16px] text-dt-primary">{best}</span>
          <span className="dt-caption">{t('best')} WPM</span>
        </div>
      </div>
      <div className="px-6 py-[18px] pb-[10px]">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
          <defs>
            <linearGradient id="wpmTrendFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0,1,2,3].map(i => (
            <line key={i} x1={0} x2={w} y1={(i+1)*base/4} y2={(i+1)*base/4} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.5" />
          ))}
          <path d={area} fill="url(#wpmTrendFade)" />
          <path d={line} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hi !== null && <line x1={xs[hi]} x2={xs[hi]} y1={pad-6} y2={base} stroke="var(--dt-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
          {data.map((_d, i) => (
            <g key={i}>
              <circle cx={xs[i]} cy={ys[i]} r={hi === i ? 6 : 3} fill="var(--dt-primary)" />
              <rect x={xs[i] - (w / data.length) / 2} y={0} width={w / data.length} height={base} fill="transparent"
                onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(p => p === i ? null : p)} />
            </g>
          ))}
          {hi !== null && (() => {
            const tw = 120, tx = Math.min(Math.max(xs[hi] - tw/2, 4), w - tw - 4), ty = Math.max(ys[hi] - 60, 6);
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={tw} height={48} rx={8} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx+12} y={ty+19} fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{data[hi].date}</text>
                <text x={tx+12} y={ty+37} fontSize="15" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">{data[hi].wpm} <tspan fontSize="9" fill="var(--dt-text-3)">WPM · #{data[hi].rank}</tspan></text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const MyPage = () => {
  return (
    <div className="dt-page">
      <ProfileHeader />
      <BadgesCard />
      <StreakCard />

      <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
        <CoreDetailCard />
        <LanguageStatsCard />
      </div>

      <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <CoreGrowthCard />
        <LanguageRadarCard />
      </div>

      <div className="mt-5">
        <WpmTrendCard />
      </div>
    </div>
  );
};

export default MyPage;
