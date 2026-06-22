import { useState, useEffect } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import PlayEditor from '@/components/PlayEditor';
import Avatar from '@/components/Avatar';
import Stat from '@/components/Stat';
import { IconClock, IconPlay, IconTrophy, IconX, IconCode, IconChevronRight } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';
import { LANG_ICON } from '@/data';
import {
  getDailyChallenge,
  submitDailyChallenge,
  getDailyLeaderboard,
  type DailyChallengeDto,
  type LeaderboardItem,
  type SubmitDailyChallengeResponseDto,
} from '@/apis/dailyChallengeApi';

type Phase = 'intro' | 'typing' | 'result';

const EXT: Record<string, string> = {
  javascript: '.js', typescript: '.ts', python: '.py',
  go: '.go', java: '.java', sql: '.sql',
};
const DIFF_COLOR: Record<string, string> = {
  easy: '#3DD68C', medium: '#57E5FF', hard: '#B93CFF',
};

// ─── Dummy history data ───────────────────────────────────────────────────────
const CHALLENGE_HISTORY = [
  { date: '2026-06-21', wpm: 112, rank: 3,   total: 4218 },
  { date: '2026-06-20', wpm: 98,  rank: 17,  total: 3941 },
  { date: '2026-06-19', wpm: 105, rank: 8,   total: 4102 },
  { date: '2026-06-18', wpm: 88,  rank: 44,  total: 3877 },
  { date: '2026-06-17', wpm: 117, rank: 2,   total: 4560 },
  { date: '2026-06-16', wpm: 93,  rank: 28,  total: 3720 },
  { date: '2026-06-15', wpm: 101, rank: 11,  total: 4033 },
];

// ─── Weekly challenge strip ───────────────────────────────────────────────────
function WeeklyChallengeStrip() {
  const t = useT();
  const DOW = [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const future = d > today;
    const isToday = d.getTime() === today.getTime();
    const n = Math.floor(d.getTime() / 86400000);
    const s = Math.sin(n * 12.9898 + 2026 * 3.17) * 43758.5453;
    const submitted = !future && (s - Math.floor(s)) > 0.4;
    const wpm = submitted ? 70 + Math.round(Math.abs(Math.sin(n * 0.7)) * 60) : null;
    return { d, future, isToday, submitted, wpm };
  });
  const done = days.filter(x => x.submitted).length;

  return (
    <div className="dt-card flex items-center gap-[18px] px-5 py-[14px] mb-5">
      <div className="flex flex-col gap-[3px] shrink-0">
        <span className="dt-label">{t('This week')}</span>
        <span className="dt-mono tabular-nums text-[18px] text-dt-text">
          {done}<span className="text-[12px] text-dt-text-3">/7</span>
        </span>
      </div>
      <div className="flex gap-[10px] flex-1 justify-between">
        {days.map((x, i) => {
          const bg = x.future
            ? 'rgba(255,255,255,0.035)'
            : x.submitted
              ? (x.wpm! >= 100 ? 'rgba(80,250,123,0.85)' : x.wpm! >= 80 ? 'rgba(80,250,123,0.55)' : 'rgba(80,250,123,0.32)')
              : 'rgba(255,255,255,0.06)';
          return (
            <div key={i} title={x.submitted ? `${x.wpm} WPM` : ''} className="flex flex-col items-center gap-[6px] flex-1">
              <span className="text-[10px] font-dt-mono"
                style={{ color: x.isToday ? 'var(--dt-primary)' : 'var(--dt-text-3)', fontWeight: x.isToday ? 700 : 400 }}>
                {DOW[i]}
              </span>
              <div className="w-full h-7 rounded-[7px] flex items-center justify-center"
                style={{
                  background: bg,
                  boxShadow: x.isToday ? 'inset 0 0 0 1.5px var(--dt-primary)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
                }}>
                {x.submitted && (
                  <span className="text-[10px] font-bold font-dt-mono" style={{ color: '#0A1A0E' }}>{x.wpm}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── History modal ────────────────────────────────────────────────────────────
function ChallengeHistoryModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      style={{ background: 'rgba(7,12,31,0.72)', backdropFilter: 'blur(10px)', animation: 'dt-fade 160ms ease-out' }}
      onClick={onClose}
    >
      <div
        className="dt-card w-full max-w-[640px] max-h-[82vh] overflow-hidden flex flex-col p-0"
        style={{ animation: 'dt-rise 200ms ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-[10px] px-6 py-5 border-b border-dt-border/50">
          <span className="text-[18px]">📅</span>
          <span className="dt-h3 m-0">{t('Daily challenge history')}</span>
          <span className="dt-caption ml-auto">{CHALLENGE_HISTORY.length} {t('entries')}</span>
          <button
            onClick={onClose}
            className="ml-2 w-8 h-8 rounded-[10px] border-0 cursor-default bg-dt-hover text-dt-text-2 flex items-center justify-center"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="grid gap-3 px-6 py-3 shadow-[inset_0_-1px_0_var(--dt-border)]"
          style={{ gridTemplateColumns: '1fr 90px 120px' }}>
          <span className="dt-label">{t('Date')}</span>
          <span className="dt-label text-right">WPM</span>
          <span className="dt-label text-right">{t('Rank')}</span>
        </div>
        <div className="overflow-y-auto">
          {CHALLENGE_HISTORY.map((h, i) => (
            <div key={h.date}
              className="grid items-center gap-3 px-6 py-[13px]"
              style={{
                gridTemplateColumns: '1fr 90px 120px',
                boxShadow: i < CHALLENGE_HISTORY.length - 1 ? 'inset 0 -1px 0 var(--dt-border)' : 'none',
              }}>
              <span className="dt-mono text-[13px] text-dt-text-2">{h.date}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text">{h.wpm}</span>
              <span className="dt-mono tabular-nums text-right text-[13px] text-dt-text-2">
                #{h.rank} <span className="dt-caption">/ {h.total.toLocaleString()}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Intro: mac-style editor preview ─────────────────────────────────────────
function DailyIntro({ ch, isLoggedIn, onStart }: { ch: DailyChallengeDto; isLoggedIn: boolean; onStart: () => void }) {
  const t = useT();
  const langKey = ch.snippet.language.toLowerCase();
  const ext = EXT[langKey] || '.txt';
  const icon = LANG_ICON[langKey];
  const lines = ch.snippet.content.split('\n');

  return (
    <div className="flex flex-col overflow-hidden rounded-dt-md"
      style={{
        background: 'var(--dt-type-bg)',
        minHeight: 'calc(100vh - 230px)',
        boxShadow: 'inset 0 0 0 1px rgba(120,150,255,0.18), 0 24px 64px -30px rgba(0,0,0,0.8)',
      }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0"
        style={{ boxShadow: 'inset 0 -1px 0 rgba(120,150,255,0.14)' }}>
        <span className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <span className="ml-2 flex items-center gap-[7px] text-[12.5px] text-[#7A8195] font-dt-mono">
          {icon && <img src={icon} alt="" className="w-[15px] h-[15px] object-contain" />}
          challenge{ext}
        </span>
        <span className="ml-auto text-[11.5px] text-[#56657F] font-dt-mono">{t('Preview only')}</span>
      </div>

      {/* Code body */}
      <div className="flex-1 py-[18px] font-dt-mono text-[15.5px] leading-[1.95] overflow-y-auto"
        style={{ display: 'grid', gridTemplateColumns: '56px 1fr' }}>
        <div className="text-right pr-[18px] text-[#3A4660] select-none"
          style={{ boxShadow: 'inset -1px 0 0 rgba(120,150,255,0.1)' }}>
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <div className="pl-[22px] whitespace-pre overflow-x-auto text-dt-type-pending">
          {lines.map((ln, i) => <div key={i}>{ln || ' '}</div>)}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-[18px] px-[18px] py-[14px] shrink-0 font-dt-mono text-[12.5px] text-[#7A8195]"
        style={{ boxShadow: 'inset 0 1px 0 rgba(120,150,255,0.14)' }}>
        <span className="flex items-center gap-[6px]">
          <span className="w-[6px] h-[6px] rounded-full bg-dt-warning" />
          {ch.snippet.language}
        </span>
        <span>{ch.snippet.content.length} {t('chars')}</span>
        <span>{lines.length} {t('lines')}</span>
        <span className="ml-auto flex items-center gap-[14px]">
          {isLoggedIn ? (
            <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onStart}>
              <IconPlay size={16} /> {t('Start challenge')}
            </button>
          ) : (
            <span className="dt-caption">{t('Log in to record your result.')}</span>
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Inline stat widget ───────────────────────────────────────────────────────
function DailyInlineStat({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-end leading-none">
      <span className="dt-mono tabular-nums text-[24px] font-semibold"
        style={{ color: accent ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
        {value}<span className="text-[12px] text-dt-text-3">{unit}</span>
      </span>
      <span className="text-[10px] tracking-[0.08em] uppercase text-dt-text-3 mt-[3px]">{label}</span>
    </div>
  );
}

// ─── Typing phase ─────────────────────────────────────────────────────────────
function DailyTyping({
  ch, progress, resetKey, caret, density, onProgress, onFinish,
}: {
  ch: DailyChallengeDto;
  progress: TypingProgress;
  resetKey: number;
  caret: string;
  density: string;
  onProgress: (p: TypingProgress) => void;
  onFinish: (r: TypingResult) => void;
}) {
  const t = useT();
  const langKey = ch.snippet.language.toLowerCase();
  const ext = EXT[langKey] || '.txt';
  const icon = LANG_ICON[langKey];
  const pct = (progress.index / Math.max(1, progress.total)) * 100;

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Meta strip */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <img src={icon} alt="" className="w-[26px] h-[26px] object-contain" />}
          <span className="dt-h2 m-0">{ch.snippet.language}</span>
          <span className="text-[11px] font-semibold px-[11px] py-1 rounded-full flex items-center gap-[6px] tracking-[0.06em]"
            style={{
              color: 'var(--dt-error)',
              background: 'color-mix(in oklab, var(--dt-error) 14%, transparent)',
              boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--dt-error) 40%, transparent)',
            }}>
            <span className="dt-live-dot" style={{ background: 'var(--dt-error)' }} />
            {t('CHALLENGE LIVE')}
          </span>
        </div>
        <div className="flex items-center gap-[22px]">
          <DailyInlineStat label={t('WPM')} value={progress.wpm} accent />
          <DailyInlineStat label={t('Accuracy')} value={progress.acc.toFixed(0)} unit="%" />
          <DailyInlineStat label={t('Time')} value={(progress.elapsed / 1000).toFixed(0)} unit="s" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="dt-progress mb-[18px]" style={{ height: 6 }}>
        <div style={{ width: `${pct}%` }} />
      </div>

      <PlayEditor
        fill
        code={ch.snippet.content}
        resetKey={resetKey}
        caretStyle={caret as 'line' | 'under' | 'block'}
        fontSize={density === 'compact' ? 17 : 20}
        onProgress={onProgress}
        onFinish={onFinish}
        fileName={`challenge${ext}`}
        index={progress.index}
        total={progress.total}
      />

      <p className="dt-caption text-center text-dt-text-3 mt-[14px] shrink-0">
        {t('Give it your best!')}
      </p>
    </div>
  );
}

// ─── Result card (no CORE — will be added after backend update) ───────────────
function DailyResultCard({
  result, submitResult, onRetry,
}: {
  result: TypingResult;
  submitResult: SubmitDailyChallengeResponseDto | null;
  onRetry: () => void;
}) {
  const t = useT();
  return (
    <div className="dt-card p-9 text-center">
      <div className="w-[60px] h-[60px] rounded-full mx-auto mb-[18px] flex items-center justify-center text-dt-primary"
        style={{ background: 'var(--dt-gradient-soft)' }}>
        <IconTrophy size={30} />
      </div>
      <h2 className="dt-h1 m-0 mb-2">{t('Challenge submitted.')}</h2>
      <p className="dt-body-sm text-dt-text-2 mb-[26px]">
        {t("You'll see your final position when the day closes. Live rank shown below.")}
      </p>
      <div className="flex justify-center gap-10 flex-wrap mb-6">
        <Stat label="WPM" value={result.wpm} accent />
        <Stat label="Accuracy" value={result.acc.toFixed(1)} unit="%" />
        {submitResult && <Stat label={t('Live rank')} value={`#${submitResult.afterRank}`} />}
        <Stat label="Time" value={(result.elapsed / 1000).toFixed(1)} unit="s" />
      </div>
      <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onRetry}>
        {t('Try again')}
      </button>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function DailyLeaderboard({ items, total, myUserId }: { items: LeaderboardItem[]; total: number; myUserId?: number }) {
  const t = useT();
  return (
    <div className="dt-card p-0 overflow-hidden self-start">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dt-border/50">
        <div className="flex flex-col gap-[2px]">
          <span className="dt-h3 m-0">{t('Live leaderboard')}</span>
          <span className="dt-caption">by nWpm</span>
        </div>
        <span className="flex items-center gap-[6px]">
          <span className="dt-live-dot" />
          <span className="dt-caption">{total} {t('today')}</span>
        </span>
      </div>
      <div className="p-2">
        {items.slice(0, 10).map(r => (
          <div key={r.userId}
            className="grid items-center gap-[10px] px-3 py-[9px] rounded-lg"
            style={{
              gridTemplateColumns: '34px 1fr auto auto',
              background: r.userId === myUserId
                ? 'color-mix(in oklab, var(--dt-primary) 8%, transparent)'
                : 'transparent',
            }}>
            <span className="dt-mono tabular-nums text-[13px]"
              style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text-2)', fontWeight: r.rank <= 3 ? 700 : 500 }}>
              {r.rank}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <Avatar handle={r.username} hue={(r.username.charCodeAt(0) * 7) % 360} size={24} />
              <span className="dt-mono text-[13px] truncate">
                {r.username}{r.userId === myUserId && ' (you)'}
              </span>
            </div>
            <span className="dt-mono tabular-nums dt-caption min-w-[52px] text-right">{r.wpm} <span className="opacity-70">wpm</span></span>
            <span className="dt-mono tabular-nums text-[14px] font-bold min-w-[48px] text-right text-dt-primary">
              {r.nWpm.toFixed(0)}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="dt-caption text-center py-6">Submit today to appear on the board.</p>
        )}
        <div className="text-center p-3">
          <button className="dt-btn dt-btn-secondary dt-btn-sm">
            {t('View top 100')} <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Daily = () => {
  const t = useT();
  const caret = useAppStore(s => s.caret);
  const density = useAppStore(s => s.density);
  const { isLoggedIn, userId: myUserId } = useUserStore();

  const [phase, setPhase] = useState<Phase>('intro');
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitDailyChallengeResponseDto | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [challenge, setChallenge] = useState<DailyChallengeDto | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderTotal, setLeaderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Countdown
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(id); }, []);
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setHours(24, 0, 0, 0);
  const msLeft = tomorrow.getTime() - now.getTime();
  const hLeft = Math.floor(msLeft / 3600000);
  const mLeft = Math.floor((msLeft / 60000) % 60);
  const sLeft = Math.floor((msLeft / 1000) % 60);
  const pad = (n: number) => String(n).padStart(2, '0');

  const loadLeaderboard = () =>
    getDailyLeaderboard()
      .then(lb => { setLeaderboard(lb.items); setLeaderTotal(lb.total); })
      .catch(() => {});

  useEffect(() => {
    getDailyChallenge()
      .then(ch => { setChallenge(ch); })
      .catch(() => {})
      .finally(() => setLoading(false));
    loadLeaderboard();
  }, []);

  const start = () => { setPhase('typing'); setResetKey(k => k + 1); };
  const retry = () => { setPhase('intro'); setResult(null); setSubmitResult(null); };

  const onFinish = async (r: TypingResult) => {
    setResult(r);
    setPhase('result');
    if (!challenge || !isLoggedIn) return;
    const durationSec = Math.round(r.elapsed / 1000);
    if (durationSec < 3) return;
    try {
      const res = await submitDailyChallenge({
        wpm: r.wpm, rawWpm: r.rawWpm, accuracy: r.acc,
        durationSec, typos: r.typos, replayData: r.replayData,
      });
      setSubmitResult(res);
      loadLeaderboard();
    } catch {
      // 비로그인 or 오류 무시
    }
  };

  if (loading) {
    return (
      <div className="dt-page text-center pt-20 text-dt-text-3 font-dt-mono">
        loading daily challenge...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="dt-page text-center pt-20 text-dt-text-3">
        오늘의 챌린지를 불러올 수 없습니다.
      </div>
    );
  }

  const langKey = challenge.snippet.language.toLowerCase();
  const icon = LANG_ICON[langKey];
  const diffColor = DIFF_COLOR[challenge.snippet.difficulty] || 'var(--dt-primary)';

  return (
    <div className="dt-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-6 flex-wrap mb-[22px]">
        <div className="flex items-center gap-[18px]">
          {/* Language tile */}
          <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(150deg, color-mix(in oklab, ${diffColor} 24%, #0B0E16), #0B0E16)`,
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${diffColor} 34%, transparent)`,
            }}>
            {icon
              ? <img src={icon} alt="" className="w-[34px] h-[34px] object-contain" />
              : <IconCode size={30} style={{ color: diffColor }} />}
          </div>
          <div>
            <div className="dt-label flex items-center gap-2 mb-[7px]" style={{ color: 'var(--dt-warning)' }}>
              <span className="dt-live-dot" style={{ background: 'var(--dt-warning)' }} />
              {t("Today's Challenge")}
            </div>
            <h1 className="m-0 font-dt-display font-semibold text-[36px] tracking-[-0.03em] leading-none flex items-center gap-3">
              {challenge.snippet.language}
              <span className="text-[13px] font-semibold px-3 py-1 rounded-full tracking-[0.02em]"
                style={{
                  color: diffColor,
                  background: `color-mix(in oklab, ${diffColor} 14%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${diffColor} 40%, transparent)`,
                }}>
                {challenge.snippet.difficulty === 'easy' ? 'Easy' : challenge.snippet.difficulty === 'medium' ? 'Medium' : 'Hard'}
              </span>
            </h1>
            <p className="m-0 mt-[9px] text-dt-text-3 text-[13.5px] dt-mono">{challenge.date}</p>
          </div>
        </div>

        {/* Countdown + history */}
        <div className="flex items-center gap-3">
          <button
            className="dt-btn dt-btn-secondary h-16 inline-flex items-center gap-2"
            onClick={() => setShowHistory(true)}
          >
            <IconClock size={18} /> {t('My history')}
          </button>
          <div className="flex items-center gap-[14px] px-5 py-[14px] rounded-[14px] bg-dt-card shadow-[inset_0_0_0_1px_var(--dt-border)]">
            <IconClock size={20} style={{ color: 'var(--dt-warning)' }} />
            <div>
              <div className="dt-label text-dt-text-3 mb-[5px]">{t('Resets in')}</div>
              <div className="dt-mono tabular-nums text-[30px] font-semibold leading-none text-dt-text tracking-[0.01em]">
                {pad(hLeft)}<span className="text-dt-text-3">:</span>{pad(mLeft)}<span className="text-dt-text-3">:</span>{pad(sLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showHistory && <ChallengeHistoryModal onClose={() => setShowHistory(false)} />}

      {phase !== 'typing' && <WeeklyChallengeStrip />}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      {phase === 'typing' ? (
        <DailyTyping
          ch={challenge}
          progress={progress}
          resetKey={resetKey}
          caret={caret}
          density={density}
          onProgress={setProgress}
          onFinish={onFinish}
        />
      ) : (
        <div className="grid gap-5 items-start" style={{ gridTemplateColumns: '1.55fr 1fr' }}>
          <div>
            {phase === 'intro'
              ? <DailyIntro ch={challenge} isLoggedIn={isLoggedIn} onStart={start} />
              : result && <DailyResultCard result={result} submitResult={submitResult} onRetry={retry} />}
          </div>
          <DailyLeaderboard items={leaderboard} total={leaderTotal} myUserId={myUserId ?? undefined} />
        </div>
      )}
    </div>
  );
};

export default Daily;
