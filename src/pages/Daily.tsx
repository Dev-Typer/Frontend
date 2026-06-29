import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import TypingEngine from '@/components/TypingEngine';
import RaceProgress from '@/components/RaceProgress';
import Avatar from '@/components/Avatar';
import StatCard from '@/components/StatCard';
import { IconClock, IconPlay, IconCode, IconChevronRight } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';
import { LANG_ICON } from '@/data';
import coreLogo from '@/assets/core-logo.png';
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
          {lines.map((ln, i) => <div key={i}>{ln || ' '}</div>)}
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

// ─── DailyInlineStat ─────────────────────────────────────────────────────────
function DailyInlineStat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col items-end leading-none">
      <span className="dt-mono tabular-nums text-[22px] font-semibold text-dt-text">
        {value}<span className="text-[12px] text-dt-text-3">{unit}</span>
      </span>
      <span className="text-[9.5px] tracking-[0.07em] uppercase text-dt-text-3 mt-[3px]">{label}</span>
    </div>
  );
}

const DAILY_VISIBLE_LINES = 8;

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
  const navigate = useNavigate();
  const { username, profileUrl } = useUserStore();
  const [typed, setTyped] = useState('');

  const langKey = ch.snippet.language.toLowerCase();
  const icon = LANG_ICON[langKey];
  const code = ch.snippet.content;
  const fontSize = density === 'compact' ? 16 : 19;
  const lh = Math.round(fontSize * 1.95);
  const lines = useMemo(() => code.split('\n'), [code]);
  const totalLines = lines.length;
  const wordCount = useMemo(() => code.trim().split(/\s+/).filter(Boolean).length, [code]);

  const frag = useMemo(() => typed.match(/(\S*)$/)?.[0] ?? '', [typed]);
  const activeLine = useMemo(() => code.slice(0, typed.length).split('\n').length - 1, [code, typed]);
  const pct = code.length ? (typed.length / code.length) * 100 : 0;

  const maxOffset = Math.max(0, totalLines - DAILY_VISIBLE_LINES);
  const offset = Math.min(maxOffset, Math.max(0, activeLine - 3));
  const viewportH = DAILY_VISIBLE_LINES * lh;
  const translateY = -(offset * lh);

  const gutterW = String(totalLines).length;
  const me = { handle: username ?? 'you', avatarHue: ((username ?? 'you').charCodeAt(0) * 7) % 360, src: profileUrl ?? undefined };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0" style={{ paddingBottom: 18 }}>
        <div className="flex items-center gap-3">
          {icon && <img src={icon} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
          <span className="font-dt-mono font-bold text-[15px] uppercase tracking-[0.06em] text-dt-text">
            {ch.snippet.language}
          </span>
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
        <div className="flex items-center gap-5">
          <DailyInlineStat label={t('Accuracy')} value={progress.acc.toFixed(0)} unit="%" />
          <DailyInlineStat label={t('Time')} value={(progress.elapsed / 1000).toFixed(0)} unit="s" />
          <div style={{ width: 1, height: 28, background: 'var(--dt-border)' }} />
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={() => navigate(-1)}>
            {t('나가기')}
          </button>
        </div>
      </div>

      {/* ── Race progress bar ── */}
      <div style={{ marginBottom: 18 }}>
        <RaceProgress pct={pct} me={me} />
      </div>

      {/* ── WPM pill ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div className="dt-race-wpm">
          <span className="dt-race-checker" aria-hidden="true" />
          <span className="dt-mono dt-tabular" style={{ fontSize: 15 }}>
            {progress.wpm > 0 ? progress.wpm : '---'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>wpm</span>
        </div>
      </div>

      {/* ── Scroll viewport ── */}
      <div className="dt-snip-viewport" style={{ height: viewportH, fontSize, fontFamily: 'var(--dt-font-mono)' }}>
        <div className="dt-snip-scroll" style={{ transform: `translateY(${translateY}px)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${gutterW + 1.5}ch 1fr` }}>
            {/* Line numbers */}
            <div>
              {lines.map((_, i) => (
                <div key={i} style={{
                  height: lh, lineHeight: `${lh}px`,
                  textAlign: 'right', paddingRight: 18,
                  fontSize, fontFamily: 'var(--dt-font-mono)',
                  color: 'var(--dt-text-3)', opacity: 0.55, userSelect: 'none',
                  boxShadow: 'inset -1px 0 0 var(--dt-border)',
                }}>
                  {i + 1}
                </div>
              ))}
            </div>
            {/* TypingEngine */}
            <div style={{ paddingLeft: 18, overflow: 'hidden' }}>
              <TypingEngine
                code={code}
                resetKey={resetKey}
                caretStyle={caret as 'line' | 'under' | 'block'}
                fontSize={fontSize}
                onProgress={onProgress}
                onFinish={onFinish}
                onTypedChange={setTyped}
                embedded
                noPadding
                noStatusBar
                noAutoScroll
              />
            </div>
          </div>
        </div>
        {offset > 0 && <div className="dt-snip-fade dt-snip-fade-top" />}
        {offset < maxOffset && <div className="dt-snip-fade dt-snip-fade-bot" />}
      </div>

      {/* ── Meta line ── */}
      <div className="dt-mono" style={{ padding: '12px 4px 0', fontSize: 12.5, color: 'var(--dt-text-3)', display: 'flex', gap: 10 }}>
        <span>{totalLines} {totalLines === 1 ? 'line' : 'lines'}</span>
        <span>/</span>
        <span>{wordCount} words</span>
        <span>/</span>
        <span>{code.length} chars</span>
        {totalLines > DAILY_VISIBLE_LINES && (
          <span style={{ marginLeft: 'auto', color: 'var(--dt-text-2)' }}>
            {Math.min(activeLine + 1, totalLines)} / {totalLines}
          </span>
        )}
      </div>

      {/* ── Input row (daily: no restart button) ── */}
      <div className="dt-type-inputrow" style={{ justifyContent: 'flex-start', padding: '22px 0 4px', gap: 12 }}>
        <div className="dt-type-input" style={{ width: 360 }}>
          <span className="dt-mono" style={{ fontSize: 16, color: 'var(--dt-text)', whiteSpace: 'pre' }}>{frag}</span>
          <span className="dt-type-caret" />
        </div>
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function DailyResultCard({
  ch, result, submitResult, leaderboard, leaderTotal, myUserId, onRetry,
}: {
  ch: DailyChallengeDto;
  result: TypingResult;
  submitResult: SubmitDailyChallengeResponseDto | null;
  leaderboard: LeaderboardItem[];
  leaderTotal: number;
  myUserId?: number;
  onRetry: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─ CORE hero ─ */}
      <div className="dt-card p-0 overflow-hidden">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
          <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="dt-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <img src={coreLogo} style={{ width: 19, height: 19, objectFit: 'contain' }} />
              {submitResult ? t('CORE this run') : t('Challenge complete.')}
            </div>
            {submitResult ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span className="dt-mono dt-tabular" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: 'var(--dt-primary)' }}>
                    {Math.round(submitResult.core)}
                  </span>
                </div>
              </>
            ) : (
              <p className="dt-body-sm text-dt-text-2 mt-1">{t('Log in to save your result.')}</p>
            )}
          </div>
          <div style={{ background: 'var(--dt-border)' }} />
          <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            {submitResult ? (
              <>
                <div className="dt-label">{t('Live rank')}</div>
                <div className="dt-mono dt-tabular" style={{ fontSize: 28, fontWeight: 700 }}>
                  #{submitResult.afterRank}
                </div>
                <div className="dt-caption" style={{ marginTop: 2 }}>
                  {t("You'll see your final position when the day closes.")}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={() => navigate('/login')} style={{ alignSelf: 'flex-start' }}>
                  {t('Sign in with GitHub')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─ Stat cards ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        <StatCard label={t('WPM')} value={result.wpm} />
        <StatCard label={t('Accuracy')} value={result.acc.toFixed(1)} unit="%" sub={`${result.errors} ${t('mistakes corrected')}`} />
        <StatCard label={t('Time')} value={(result.elapsed / 1000).toFixed(1)} unit="s" />
        <StatCard label={t('Live rank')} value={submitResult ? `#${submitResult.afterRank}` : '—'} />
        <StatCard label={t('Challenge date')} value={ch.date} />
      </div>

      {/* ─ Try again ─ */}
      <div>
        <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onRetry}>
          {t('Try again')}
        </button>
      </div>

      {/* ─ Daily Leaderboard ─ */}
      <DailyLeaderboard items={leaderboard} total={leaderTotal} myUserId={myUserId} />
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function DailyLeaderboard({ items, total, myUserId }: { items: LeaderboardItem[]; total: number; myUserId?: number }) {
  const t = useT();
  const navigate = useNavigate();
  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dt-border/50">
        <div className="flex flex-col gap-[2px]">
          <span className="dt-h3 m-0">{t('Live leaderboard')}</span>
          <span className="dt-caption">by CORE</span>
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
              <Avatar handle={r.username} hue={(r.username.charCodeAt(0) * 7) % 360} size={24} src={r.profileUrl ?? undefined} />
              <span className="dt-mono text-[13px] truncate">
                {r.username}{r.userId === myUserId && ' (you)'}
              </span>
            </div>
            <span className="dt-mono tabular-nums dt-caption min-w-[52px] text-right">{r.wpm} <span className="opacity-70">wpm</span></span>
            <span className="dt-mono tabular-nums text-[14px] font-bold min-w-[56px] text-right text-dt-primary flex items-center justify-end gap-[3px]">
              {Math.round(r.core)}
              <img src={coreLogo} style={{ width: 13, height: 13, objectFit: 'contain', opacity: 0.75 }} />
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="dt-caption text-center py-6">{t('Submit today to appear on the board.')}</p>
        )}
        <div className="text-center p-3">
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={() => navigate('/ranking?tab=daily')}>
            {t('View full ranking')} <IconChevronRight size={14} />
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
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(id); }, []);
  const now = new Date();
  const nextUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const msLeft = nextUtcMidnight.getTime() - now.getTime();
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
    const durationSec = Math.max(1, Math.round(r.elapsed / 1000));
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

  if (phase === 'typing') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '40px 72px' }}>
        <DailyTyping
          ch={challenge}
          progress={progress}
          resetKey={resetKey}
          caret={caret}
          density={density}
          onProgress={setProgress}
          onFinish={onFinish}
        />
      </div>
    );
  }

  return (
    <div className="dt-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-6 flex-wrap mb-[22px]">
        <div className="flex items-center gap-[18px]">
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

        {/* Countdown */}
        <div className="flex items-center gap-3">
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

      {/* ── Body ────────────────────────────────────────────────────────── */}
      {phase === 'result' && result ? (
        <DailyResultCard
          ch={challenge}
          result={result}
          submitResult={submitResult}
          leaderboard={leaderboard}
          leaderTotal={leaderTotal}
          myUserId={myUserId ?? undefined}
          onRetry={retry}
        />
      ) : (
        <div className="grid gap-5 items-start" style={{ gridTemplateColumns: '1.55fr 1fr' }}>
          <DailyIntro ch={challenge} isLoggedIn={isLoggedIn} onStart={start} />
          <DailyLeaderboard items={leaderboard} total={leaderTotal} myUserId={myUserId ?? undefined} />
        </div>
      )}
    </div>
  );
};

export default Daily;
