import { useState, useMemo, useEffect, useRef } from 'react';
import { useT } from '@/i18n';
import { useUserStore } from '@/stores/userStore';
import { LANG_ICON } from '@/data';
import Avatar from '@/components/Avatar';
import { IconChevronDown } from '@/components/icons/Icons';
import {
  getUserStreak,
  getUserWpmHistory,
  getUserCore,
  getUserCoreByLanguage,
  getUserCoreHistory,
  uploadProfileImage,
  deleteProfileImage,
  uploadBannerImage,
  deleteBannerImage,
} from '@/apis/userApi';
import type {
  UserStreakResponse,
  UserWpmHistoryResponse,
  UserCoreResponse,
  UserCoreByLangResponse,
  UserCoreHistoryResponse,
  StreakEntry,
} from '@/types';

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const BADGES = [
  { emoji: '⚡', name: '100 WPM 돌파',  color: '#57E5FF', earned: true  },
  { emoji: '🔥', name: '14일 연속',      color: '#FF7A3C', earned: true  },
  { emoji: '🌐', name: 'CORE 5K 돌파',  color: '#B93CFF', earned: true  },
  { emoji: '🎯', name: '정확도 99%',     color: '#3DD68C', earned: true  },
  { emoji: '🏆', name: '챌린지 Top 10', color: '#FFD060', earned: true  },
  { emoji: '💎', name: 'CORE 8K 돌파',  color: '#5AA8FF', earned: false },
  { emoji: '🐍', name: 'Python 마스터', color: '#3DD68C', earned: false },
  { emoji: '👑', name: '챌린지 1위',    color: '#FFD060', earned: false },
];

const LANG_DISPLAY: Record<string, string> = {
  JAVASCRIPT: 'JavaScript', TYPESCRIPT: 'TypeScript',
  PYTHON: 'Python', JAVA: 'Java', CPP: 'C++', KOTLIN: 'Kotlin',
};

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
function avatarHueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

function levelBg(lv: number): string {
  return ['rgba(255,255,255,0.04)', 'rgba(80,250,123,0.22)', 'rgba(80,250,123,0.40)', 'rgba(80,250,123,0.62)', 'rgba(80,250,123,0.85)'][lv];
}

function formatJoined(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(iso: string): string {
  const d = new Date(iso + '-01');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
}

// ─── 카드 스켈레톤 ─────────────────────────────────────────────────────────────
const CardSkeleton = ({ height = 240 }: { height?: number }) => (
  <div className="dt-card animate-pulse" style={{ minHeight: height }} />
);

// ─── BannerSection ────────────────────────────────────────────────────────────
const BannerSection = () => {
  const { bannerUrl, username, setBannerUrl } = useUserStore();
  const hue = avatarHueFromName(username ?? '');
  const bannerInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { bannerUrl: url } = await uploadBannerImage(file);
      setBannerUrl(url);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleBannerDelete = async () => {
    setUploading(true);
    try { await deleteBannerImage(); setBannerUrl(null); }
    finally { setUploading(false); }
  };

  return (
    /* 권장 배너 업로드 사이즈: 1500 × 400 px (15:4 비율) */
    <div className="relative w-full overflow-hidden" style={{ height: 400 }}>
      {bannerUrl
        ? <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        : <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg,
              color-mix(in oklab, hsl(${hue}deg 70% 35%) 60%, #070C1F) 0%,
              color-mix(in oklab, hsl(${(hue + 40) % 360}deg 55% 20%) 40%, #070C1F) 60%,
              #070C1F 100%)`,
          }} />
      }
      {/* 노이즈 텍스처 느낌 레이어 */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
      {/* 하단 페이드 */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(7,12,31,0.95) 100%)' }} />

      {/* 배너 변경 버튼 */}
      <div className="absolute top-3 right-[44px] z-10 flex gap-2">
        <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
        <button onClick={() => bannerInput.current?.click()} disabled={uploading}
          className="px-3 py-[5px] text-[11px] font-medium rounded-[6px] border-0 cursor-default"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(8px)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}>
          {uploading ? '업로드 중…' : '배너 변경'}
        </button>
        {bannerUrl && (
          <button onClick={handleBannerDelete} disabled={uploading}
            className="px-3 py-[5px] text-[11px] font-medium rounded-[6px] border-0 cursor-default"
            style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,100,100,0.9)', backdropFilter: 'blur(8px)', boxShadow: 'inset 0 0 0 1px rgba(255,100,100,0.3)' }}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

// ─── ProfileInfoSection ────────────────────────────────────────────────────────
interface ProfileInfoSectionProps { coreData: UserCoreResponse | null; }

const ProfileInfoSection = ({ coreData }: ProfileInfoSectionProps) => {
  const t = useT();
  const { username, profileUrl, createdAt, setProfileUrl } = useUserStore();
  const hue = avatarHueFromName(username ?? '');
  const profileInput = useRef<HTMLInputElement>(null);
  const [profileHover, setProfileHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const earned = BADGES.filter(b => b.earned).length;

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const { profileUrl: url } = await uploadProfileImage(file); setProfileUrl(url); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleProfileDelete = async () => {
    setUploading(true);
    try { await deleteProfileImage(); setProfileUrl(null); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ marginTop: -70 }}>
      {/* 아바타 + 유저명 + CORE 한 줄 */}
      <div className="flex items-end gap-6">
        {/* 아바타 */}
        <input ref={profileInput} type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
        <div
          className="relative shrink-0 overflow-hidden cursor-default"
          style={{
            width: 120, height: 120,
            borderRadius: 24,
            background: 'var(--dt-surface)',
            boxShadow: '0 0 0 3px var(--dt-primary), 0 0 0 5px rgba(242,58,47,0.25), 0 12px 40px -8px rgba(0,0,0,0.8)',
            zIndex: 2,
          }}
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
          onClick={() => profileInput.current?.click()}
        >
          {profileUrl
            ? <img src={profileUrl} alt={username ?? ''} className="w-full h-full object-cover" />
            : <Avatar handle={username ?? ''} hue={hue} size={108} />
          }
          {profileHover && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}>
              <span className="text-[24px]">📷</span>
              <span className="text-[10px] text-white font-semibold tracking-wide">{uploading ? '…' : t('Change')}</span>
            </div>
          )}
        </div>

        {/* 유저명 + 가입일 */}
        <div className="flex-1 pb-3" style={{ zIndex: 2 }}>
          <h1 className="m-0 dt-mono font-bold leading-none" style={{ fontSize: 42, color: 'var(--dt-text)', letterSpacing: '-0.02em' }}>
            {username}
          </h1>
          <div className="flex items-center gap-[10px] mt-[10px]">
            <span style={{
              display: 'inline-block', width: 3, height: 14,
              background: 'var(--dt-primary)', borderRadius: 2,
            }} />
            <span className="text-[13px] text-dt-text-2">
              {t('Joined')} <span className="dt-mono text-dt-text">{createdAt ? formatJoined(createdAt) : '—'}</span>
            </span>
            {profileUrl && (
              <button onClick={(e) => { e.stopPropagation(); handleProfileDelete(); }} disabled={uploading}
                className="text-[11px] border-0 bg-transparent cursor-default ml-1" style={{ color: 'var(--dt-error)', opacity: 0.7 }}>
                {t('Remove photo')}
              </button>
            )}
          </div>
        </div>

        {/* CORE 수치 */}
        <div className="pb-3 text-right shrink-0" style={{ zIndex: 2 }}>
          <div className="dt-label text-dt-text-3 mb-1 tracking-widest text-[10px]">TOTAL CORE</div>
          <div className="dt-mono tabular-nums font-bold leading-none"
            style={{ fontSize: 68, color: 'var(--dt-primary)', textShadow: '0 0 40px rgba(242,58,47,0.35)' }}>
            {Math.round(coreData?.totalCore ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mt-5 mb-4 h-px" style={{ background: 'linear-gradient(90deg, var(--dt-primary) 0%, transparent 60%)' }} />

      {/* 뱃지 (박스 없음) */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-semibold text-dt-text-3 tracking-wider uppercase">Badges</span>
        <span className="dt-caption text-dt-text-3">
          <span className="dt-mono text-dt-primary font-semibold">{earned}</span>/{BADGES.length}
        </span>
        <div className="w-px h-4 bg-dt-border" />
        <div className="flex gap-[8px] flex-wrap">
          {BADGES.map((b, i) => <BadgeMedal key={i} badge={b} />)}
        </div>
      </div>
    </div>
  );
};

// ─── BadgeMedal ───────────────────────────────────────────────────────────────
const BadgeMedal = ({ badge }: { badge: typeof BADGES[0] }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span
        className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[18px] cursor-default"
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
};

// ─── StreakCard ────────────────────────────────────────────────────────────────
const GHOST_WEEKS = 53;

const ContributionCell = ({ cell, size }: { cell: StreakEntry | null; size: number }) => {
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
};

function buildGrid(yearData: { date: string; submitted: boolean; wpm: number | null }[]) {
  const dayMap = new Map(yearData.map(d => [d.date, d]));
  if (!yearData.length) return { weeks: [], monthSpans: [], submittedCount: 0, dayCount: 0 };

  const start   = new Date(yearData[0].date + 'T00:00:00Z');
  const end     = new Date(yearData[yearData.length - 1].date + 'T00:00:00Z');
  const days: StreakEntry[] = [];

  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso  = d.toISOString().slice(0, 10);
    const hit  = dayMap.get(iso);
    days.push({ date: iso, submitted: hit?.submitted ?? false, wpm: hit?.wpm ?? null, day: d.getUTCDay() });
  }

  const submittedCount = days.filter(d => d.submitted).length;
  const dayCount = days.filter(d => d.date <= new Date().toISOString().slice(0, 10)).length;

  const weeks: (StreakEntry | null)[][] = [];
  let cur: (StreakEntry | null)[] = Array.from({ length: 7 }, () => null);
  days[0].day && days.slice(0, days[0].day).forEach((_, p) => { cur[p] = null; });
  days.forEach(entry => {
    cur[entry.day] = entry;
    if (entry.day === 6) { weeks.push(cur); cur = Array.from({ length: 7 }, () => null); }
  });
  if (cur.some(c => c)) weeks.push(cur);

  const monthSpans: { month: number; week: number }[] = [];
  weeks.forEach((wk, wi) => {
    const first = wk.find(c => c);
    if (!first) return;
    const m = new Date(first.date + 'T00:00:00Z').getUTCMonth();
    const last = monthSpans[monthSpans.length - 1];
    if (!last || last.month !== m) monthSpans.push({ month: m, week: wi });
  });

  return { weeks, monthSpans, submittedCount, dayCount };
}

interface StreakCardProps {
  data: UserStreakResponse | null;
  loading: boolean;
  onYearChange: (year: number) => void;
}

type StreakView = number | 'recent';

function streakStatus(n: number): { label: string; color: string } {
  if (n === 0) return { label: '오늘 시작해봐요', color: 'var(--dt-text-3)' };
  if (n < 3)   return { label: '스트릭 시작!', color: '#FFD060' };
  if (n < 7)   return { label: '달리는 중 🔥', color: '#FF9A3C' };
  if (n < 30)  return { label: '일주일+ 연속!', color: '#FF7A3C' };
  return       { label: '불꽃 스트릭 🏆', color: '#FF4D00' };
}

const StreakCard = ({ data, loading, onYearChange }: StreakCardProps) => {
  const t = useT();
  const CUR_YEAR = new Date().getUTCFullYear();
  const [view, setView] = useState<StreakView>('recent');
  const cell = 15, gap = 3, col = cell + gap;
  const MONTHS = [t('Jan'),t('Feb'),t('Mar'),t('Apr'),t('May'),t('Jun'),t('Jul'),t('Aug'),t('Sep'),t('Oct'),t('Nov'),t('Dec')];

  const { weeks, monthSpans, submittedCount, dayCount } = useMemo(
    () => buildGrid(data?.yearData ?? []),
    [data],
  );

  const handleView = (v: StreakView) => {
    setView(v);
    if (v === 'recent') onYearChange(-1);
    else onYearChange(v as number);
  };
  const isEmpty = !loading && weeks.length === 0;
  const current = data?.current ?? 0;
  const longest = data?.longest ?? 0;
  const status = streakStatus(current);

  if (loading) return <CardSkeleton height={220} />;

  return (
    <div className="dt-card mt-5 overflow-hidden relative" style={{ padding: '28px 32px 24px' }}>
      {/* 배경 glow */}
      <div className="absolute top-[-50px] left-[-30px] w-[260px] h-[260px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,184,108,0.12), transparent 65%)' }} />

      <div className="relative flex gap-8 justify-center">
        {/* ── 좌: 스트릭 통계 ── */}
        <div className="shrink-0 flex flex-col justify-between py-1" style={{ width: 200 }}>
          {/* 현재 스트릭 */}
          <div>
            <div className="flex items-end gap-3 mb-2">
              <span className="dt-mono tabular-nums font-bold leading-none"
                style={{ fontSize: 64, color: current > 0 ? 'var(--dt-warning)' : 'var(--dt-text-3)', lineHeight: 1 }}>
                {current}
              </span>
              <div className="flex flex-col pb-[6px]">
                <span className="text-[26px] leading-none mb-[2px]">{current > 0 ? '🔥' : '💤'}</span>
                <span className="dt-label text-dt-text-2 whitespace-nowrap">day streak</span>
              </div>
            </div>
            <span className="text-[12px] font-semibold" style={{ color: status.color }}>{status.label}</span>
          </div>

          {/* 구분선 */}
          <div className="my-4 h-px bg-dt-border/40" />

          {/* 보조 통계 */}
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="dt-caption text-dt-text-3">최장 스트릭</span>
              <span className="dt-mono tabular-nums font-semibold text-[14px]" style={{ color: longest > 0 ? '#FFD060' : 'var(--dt-text-3)' }}>
                {longest}<span className="text-[10px] font-normal text-dt-text-3 ml-1">days</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="dt-caption text-dt-text-3">참여일</span>
              <span className="dt-mono tabular-nums font-semibold text-[13px] text-dt-text">
                {submittedCount}<span className="text-dt-text-3 font-normal"> / {dayCount}</span>
              </span>
            </div>
            {/* 참여율 바 */}
            <div className="h-[4px] rounded-full overflow-hidden bg-dt-hover">
              <div style={{
                width: dayCount > 0 ? `${(submittedCount / dayCount) * 100}%` : '0%',
                height: '100%',
                background: 'linear-gradient(90deg, var(--dt-warning), var(--dt-primary))',
                borderRadius: 999,
              }} />
            </div>
          </div>
        </div>

        <div className="w-px self-stretch bg-dt-border/40 shrink-0" />

        {/* ── 우: contribution 그리드 ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 상단: 연도 선택 */}
          <div className="flex items-center justify-between mb-2">
            <div className="relative h-4 flex-1 overflow-hidden">
              {!isEmpty && monthSpans.map((m, i) => (
                <span key={i} className="absolute text-[10px] text-dt-text-3 whitespace-nowrap"
                  style={{ left: m.week * col }}>{MONTHS[m.month]}</span>
              ))}
            </div>
            <div className="relative inline-flex items-center shrink-0 ml-3">
              <select
                value={String(view)}
                onChange={e => handleView(e.target.value === 'recent' ? 'recent' : Number(e.target.value))}
                className="dt-input dt-mono cursor-default"
                style={{ height: 28, minHeight: 28, lineHeight: '26px', padding: '0 24px 0 10px', borderRadius: 6, fontSize: 12, appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="recent">최근</option>
                {[CUR_YEAR, CUR_YEAR - 1, CUR_YEAR - 2].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="absolute right-2 pointer-events-none text-dt-text-3 flex">
                <IconChevronDown size={13} />
              </span>
            </div>
          </div>

          {/* 그리드 */}
          <div className="overflow-x-auto flex-1">
            {isEmpty ? (
              <div className="relative">
                <div className="flex pointer-events-none" style={{ gap, opacity: 0.3 }}>
                  {Array.from({ length: GHOST_WEEKS }, (_, wi) => (
                    <div key={wi} className="flex flex-col" style={{ gap }}>
                      {Array.from({ length: 7 }, (_, di) => (
                        <div key={di} style={{ width: cell, height: cell, background: levelBg(0), borderRadius: 2 }} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-[22px]">🔥</span>
                  <p className="text-[12px] font-semibold text-dt-text-2">오늘 첫 기록을 남겨보세요</p>
                  <p className="text-[11px] text-dt-text-3">데일리 챌린지를 완료하면 스트릭이 쌓입니다</p>
                </div>
              </div>
            ) : (
              <div className="flex" style={{ gap }}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap }}>
                    {week.map((cellData, di) => <ContributionCell key={di} cell={cellData} size={cell} />)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="flex items-center gap-[5px] mt-2 text-[10px] text-dt-text-3">
            <span>{t('Less')}</span>
            {[0,1,2,3,4].map(lv => (
              <div key={lv} style={{ width: cell, height: cell, background: levelBg(lv), borderRadius: 2, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)' }} />
            ))}
            <span>{t('More')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CoreDetailCard ────────────────────────────────────────────────────────────
interface CoreChipProps {
  title: string;
  language: string;
  core: number;
}

const CoreChip = ({ title, language, core }: CoreChipProps) => {
  const [show, setShow] = useState(false);
  const langKey = language.toLowerCase();
  const icon = LANG_ICON[langKey];
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
          ? <img src={icon} alt={language} className="w-[30px] h-[30px] object-contain" />
          : <span className="dt-mono text-[13px] text-dt-text">{language.slice(0, 2)}</span>}
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 z-[200] w-[220px] rounded-[12px] overflow-hidden text-left"
          style={{ background: 'var(--dt-card)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px var(--dt-border), 0 20px 50px -16px rgba(0,0,0,0.7)' }}>
          <div className="flex items-center gap-[9px] px-[15px] py-[13px] shadow-[inset_0_-1px_0_var(--dt-border)]">
            {icon && <img src={icon} alt="" className="w-[18px] h-[18px] object-contain" />}
            <span className="dt-mono text-[14px] text-dt-text truncate">{title}</span>
          </div>
          <div className="p-[13px_15px]">
            <span className="dt-mono tabular-nums text-[14px] font-semibold text-dt-primary">
              {Math.round(core)} <span className="text-[10px] text-dt-text-3">CORE</span>
            </span>
          </div>
        </div>
      )}
    </span>
  );
};

interface CoreDetailCardProps {
  data: UserCoreResponse | null;
  loading: boolean;
}

const CoreDetailCard = ({ data, loading }: CoreDetailCardProps) => {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const CAP = 10;
  const list = data?.snippetList ?? [];
  const shown = expanded ? list : list.slice(0, CAP);
  const rest  = list.length - CAP;

  if (loading) return <CardSkeleton height={280} />;

  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">CORE</span>
          <span className="dt-caption">{t('Sum of your best CORE per snippet')}</span>
        </div>
        <div className="flex items-baseline gap-[6px]">
          <span className="dt-mono tabular-nums text-[30px] font-bold text-dt-primary">
            {(data?.totalCore ?? 0).toLocaleString()}
          </span>
          <span className="dt-label text-dt-text-3">· {data?.snippetCount ?? 0} {t('snippets')}</span>
        </div>
      </div>
      <div className="px-6 py-4 pb-[18px]" style={{ minHeight: 140 }}>
        <div className="dt-label mb-3">{t('Top snippets by CORE')}</div>
        {list.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10, justifyItems: 'center' }}>
            {shown.map((s, i) => <CoreChip key={i} title={s.title} language={s.language} core={s.core} />)}
          </div>
        ) : (
          /* 고스트 칩 + 빈 상태 */
          <div className="relative">
            <div className="pointer-events-none opacity-20"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 10 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="w-[52px] h-[52px] rounded-[12px]"
                  style={{ background: 'var(--dt-hover)', boxShadow: 'inset 0 0 0 1px var(--dt-border)' }} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px]">
              <p className="text-[13px] font-semibold text-dt-text-2">⌨️ 아직 플레이한 스니펫이 없습니다</p>
              <p className="text-[11px] text-dt-text-3">Solo 모드에서 스니펫을 플레이하면 CORE가 쌓입니다</p>
            </div>
          </div>
        )}
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
        <div className="flex flex-col gap-[2px] ml-auto items-end justify-center">
          <span className="dt-caption text-right max-w-[300px] leading-[1.45]">
            {t('Only your best run per snippet counts — replay anytime, it stays in history.')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── LanguageStatsCard ────────────────────────────────────────────────────────
interface LangCardProps {
  data: UserCoreByLangResponse | null;
  loading: boolean;
}

const LanguageStatsCard = ({ data, loading }: LangCardProps) => {
  const t = useT();
  const langs = (data?.byLanguage ?? []).filter(l => l.totalCore > 0);
  const maxCore = langs.length ? Math.max(...langs.map(l => l.totalCore)) : 1;
  const GHOST_LANGS = ['JavaScript', 'Python', 'TypeScript', 'Java', 'Kotlin'];

  if (loading) return <CardSkeleton height={280} />;

  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="px-6 py-5 border-b border-dt-border/50">
        <span className="dt-h3 m-0">{t('CORE by language')}</span>
        <div className="dt-caption mt-[3px]">{t('Sum of your best CORE per snippet')}</div>
      </div>

      {langs.length === 0 ? (
        /* 고스트 바 + 빈 상태 */
        <div className="relative py-3" style={{ minHeight: 200 }}>
          <div className="pointer-events-none opacity-[0.12]">
            {GHOST_LANGS.map((_l, i) => (
              <div key={i} className="grid items-center gap-4 px-6 py-[10px]"
                style={{ gridTemplateColumns: '132px 1fr 72px 60px' }}>
                <div className="h-[13px] rounded" style={{ width: `${60 + i * 15}%`, background: 'var(--dt-text-3)' }} />
                <div className="h-[6px] rounded-full" style={{ width: `${90 - i * 14}%`, background: 'var(--dt-primary)' }} />
                <div className="h-[13px] rounded ml-auto" style={{ width: 36, background: 'var(--dt-text-3)' }} />
                <div className="h-[13px] rounded ml-auto" style={{ width: 20, background: 'var(--dt-text-3)' }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
            <span className="text-[28px] leading-none">🌐</span>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-dt-text-2 mb-[3px]">아직 언어 데이터가 없습니다</p>
              <p className="text-[11px] text-dt-text-3">다양한 언어로 스니펫을 플레이해보세요</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-3">
          {langs.map(l => (
            <div key={l.language} className="grid items-center gap-4 px-6 py-[10px]"
              style={{ gridTemplateColumns: '132px 1fr 72px 60px' }}>
              <span className="flex items-center gap-[9px] min-w-0">
                {LANG_ICON[l.language.toLowerCase()] && (
                  <img src={LANG_ICON[l.language.toLowerCase()]} alt="" className="w-[18px] h-[18px] object-contain shrink-0" />
                )}
                <span className="dt-body-sm truncate">{LANG_DISPLAY[l.language] ?? l.language}</span>
              </span>
              <div className="h-[6px] bg-dt-hover rounded-full overflow-hidden">
                <div style={{ width: `${(l.totalCore / maxCore) * 100}%`, height: '100%', background: 'var(--dt-primary)', borderRadius: 999 }} />
              </div>
              <span className="dt-mono tabular-nums text-right text-[14px] font-semibold text-dt-primary">{l.totalCore}</span>
              <span className="dt-mono tabular-nums dt-caption text-right">{l.snippetCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CoreGrowthCard ───────────────────────────────────────────────────────────
interface CoreGrowthCardProps {
  data: UserCoreHistoryResponse | null;
  loading: boolean;
}

const CoreGrowthCard = ({ data, loading }: CoreGrowthCardProps) => {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const points = data?.points ?? [];
  const vals   = points.map(p => p.totalCore);
  const max    = vals.length ? Math.max(...vals) : 1;
  const w = 640, h = 160, pad = 10, base = h - 20;
  const gain = vals.length >= 2 ? vals[vals.length-1] - vals[0] : 0;

  const xs = vals.length > 0
    ? vals.map((_, i) => (i / Math.max(vals.length - 1, 1)) * (w - 2 * pad) + pad)
    : [];
  const ys = vals.map(v => base - (v / (max || 1)) * (base - pad));
  const line = points.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = points.length > 1 ? `${line} L ${xs[xs.length-1]} ${base} L ${xs[0]} ${base} Z` : '';

  if (loading) return <CardSkeleton height={280} />;

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
      {(points.length < 2 || vals.every(v => v === 0)) ? (
        <div className="flex flex-col items-center justify-center gap-[10px]" style={{ minHeight: 220 }}>
          <span className="text-[28px] leading-none">📈</span>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-dt-text-2 mb-[3px]">CORE 성장 그래프가 여기 표시됩니다</p>
            <p className="text-[11px] text-dt-text-3">첫 스니펫을 플레이하면 트래킹이 시작됩니다</p>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-4 pb-0 flex items-end">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto block">
            <defs>
              {/* 영역 fill: primary → cyan 수직 그라디언트 */}
              <linearGradient id="coreFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#57E5FF" stopOpacity="0.32" />
                <stop offset="55%" stopColor="var(--dt-primary)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
              </linearGradient>
              {/* 선 그라디언트: cyan → primary */}
              <linearGradient id="coreLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#57E5FF" />
                <stop offset="60%" stopColor="var(--dt-primary)" />
                <stop offset="100%" stopColor="#FFD060" />
              </linearGradient>
              {/* dot glow filter */}
              <filter id="dotGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {[0,1,2,3].map(i => (
              <line key={i} x1={0} x2={w} y1={(i+1)*base/4} y2={(i+1)*base/4} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.4" strokeDasharray="4 4" />
            ))}
            <path d={area} fill="url(#coreFade)" />
            <path d={line} fill="none" stroke="url(#coreLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {hi !== null && <line x1={xs[hi]} x2={xs[hi]} y1={pad-6} y2={base} stroke="#57E5FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />}
            {points.map((p, i) => {
              const ratio = max > 0 ? vals[i] / max : 0;
              const dotColor = ratio > 0.75 ? '#57E5FF' : ratio > 0.4 ? 'var(--dt-primary)' : '#FFD060';
              const r = hi === i ? 6 : i === points.length - 1 ? 5 : 3.5;
              return (
                <g key={i}>
                  {(hi === i || i === points.length - 1) && (
                    <circle cx={xs[i]} cy={ys[i]} r={r + 5} fill={dotColor} opacity="0.18" filter="url(#dotGlow)" />
                  )}
                  <circle cx={xs[i]} cy={ys[i]} r={r} fill={dotColor} />
                  <text x={xs[i]} y={h-4} textAnchor="middle" fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{monthLabel(p.date)}</text>
                  <rect x={xs[i]-22} y={0} width={44} height={base} fill="transparent"
                    onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(prev => prev === i ? null : prev)} />
                </g>
              );
            })}
            {hi !== null && (() => {
              const prev = hi > 0 ? vals[hi] - vals[hi-1] : null;
              const tw = 130, tx = Math.min(Math.max(xs[hi]-tw/2, 4), w-tw-4), ty = Math.max(ys[hi]-68, 6);
              const deltaColor = prev !== null ? (prev >= 0 ? '#3DD68C' : '#FF6B6B') : null;
              return (
                <g pointerEvents="none">
                  <rect x={tx} y={ty} width={tw} height={56} rx={8} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                  <text x={tx+12} y={ty+20} fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{monthLabel(points[hi].date)}</text>
                  <text x={tx+12} y={ty+42} fontSize="16" fontWeight="700" fill="#57E5FF" fontFamily="var(--dt-font-mono)">{vals[hi].toLocaleString()} <tspan fontSize="9" fill="var(--dt-text-3)">CORE</tspan></text>
                  {prev !== null && (
                    <text x={tx+tw-10} y={ty+42} textAnchor="end" fontSize="12" fontWeight="600" fill={deltaColor!} fontFamily="var(--dt-font-mono)">
                      {prev >= 0 ? `+${prev}` : String(prev)}
                    </text>
                  )}
                </g>
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
};

// ─── LanguageRadarCard ────────────────────────────────────────────────────────
const ALL_RADAR_LANGS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'C', 'Rust', 'Kotlin'] as const;

const LanguageRadarCard = ({ data, loading }: LangCardProps) => {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);

  // 항상 10개 언어 고정 — 플레이 안한 언어는 totalCore: 0
  const langMap = new Map((data?.byLanguage ?? []).map(l => [l.language, l]));
  const langs = ALL_RADAR_LANGS.map(lang => ({
    language: lang,
    totalCore: langMap.get(lang)?.totalCore ?? 0,
    snippetCount: langMap.get(lang)?.snippetCount ?? 0,
    played: langMap.has(lang),
  }));

  const maxCore = Math.max(...langs.map(l => l.totalCore), 1);
  const allEmpty = langs.every(l => l.totalCore === 0);
  const top = !allEmpty ? langs.reduce((a, b) => b.totalCore > a.totalCore ? b : a) : null;

  const cx = 150, cy = 150, R = 100;
  const n = 10;
  const angle = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, r: number): [number, number] => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = (r: number) => langs.map((_, i) => pt(i, r * R).join(',')).join(' ');
  const dataPoly = langs.map((l, i) => pt(i, Math.max(0, (l.totalCore / maxCore)) * R).join(',')).join(' ');

  if (loading) return <CardSkeleton height={380} />;

  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">{t('Language focus')}</span>
          <span className="dt-caption">{t('CORE distribution')}</span>
        </div>
        {top && (
          <span className="inline-flex items-center gap-[7px] text-[12.5px] text-dt-text-2">
            {LANG_ICON[top.language.toLowerCase()] && <img src={LANG_ICON[top.language.toLowerCase()]} alt="" className="w-4 h-4 object-contain" />}
            {LANG_DISPLAY[top.language] ?? top.language}
          </span>
        )}
      </div>

      <div className="p-4 flex justify-center relative" style={{ minHeight: 300 }}>
        <svg viewBox="0 0 300 300" className="w-full max-w-[320px] h-auto">
          {/* 배경 링 */}
          {rings.map((r, i) => (
            <polygon key={i} points={polygon(r)} fill="none" stroke="var(--dt-border)" strokeWidth="0.75" opacity="0.6" />
          ))}
          {/* 축선 */}
          {langs.map((_, i) => {
            const [x, y] = pt(i, R);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.5" />;
          })}

          {/* 데이터 영역 (플레이 데이터 있을 때만) */}
          {!allEmpty && (
            <>
              <polygon points={dataPoly}
                fill="color-mix(in oklab, var(--dt-primary) 20%, transparent)"
                stroke="var(--dt-primary)" strokeWidth="2" strokeLinejoin="round" />
              {langs.map((l, i) => {
                if (!l.played) return null;
                const [x, y] = pt(i, (l.totalCore / maxCore) * R);
                return (
                  <circle key={i} cx={x} cy={y}
                    r={hi === i ? 5.5 : 3.5}
                    fill="var(--dt-primary)"
                    style={{ filter: hi === i ? 'drop-shadow(0 0 4px var(--dt-primary))' : 'none' }} />
                );
              })}
            </>
          )}

          {/* 언어 로고 라벨 (항상 표시) */}
          {langs.map((l, i) => {
            const [lx, ly] = pt(i, R + 22);
            const icon = LANG_ICON[l.language.toLowerCase()];
            const dimmed = !l.played;
            return icon
              ? <image key={i} href={icon} x={lx - 10} y={ly - 10} width="20" height="20"
                  opacity={dimmed ? 0.25 : (hi === null || hi === i ? 1 : 0.35)}
                  style={{ transition: 'opacity 150ms' }} />
              : <text key={i} x={lx} y={ly + 4} textAnchor="middle" fontSize="10"
                  fill={dimmed ? 'var(--dt-text-3)' : 'var(--dt-text-2)'}
                  opacity={hi === null || hi === i ? 1 : 0.35}
                  fontFamily="var(--dt-font-mono)">{l.language.slice(0, 2)}</text>;
          })}

          {/* hover 인터랙션 영역 */}
          {langs.map((_, i) => {
            const [ax, ay] = pt(i, R + 22);
            return (
              <circle key={i} cx={ax} cy={ay} r="16" fill="transparent"
                onMouseEnter={() => setHi(i)}
                onMouseLeave={() => setHi(prev => prev === i ? null : prev)} />
            );
          })}

          {/* 빈 상태 중앙 텍스트 */}
          {allEmpty && (
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11"
              fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">
              플레이 기록 없음
            </text>
          )}

          {/* hover 툴팁 */}
          {hi !== null && (() => {
            const l = langs[hi];
            const tw = 148, tx = Math.min(Math.max(cx - tw / 2, 4), 300 - tw - 4), ty = 6;
            return (
              <g pointerEvents="none">
                <rect x={tx} y={ty} width={tw} height={l.played ? 50 : 38} rx={8}
                  fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                <text x={tx + 12} y={ty + 18} fontSize="12" fill="var(--dt-text)"
                  fontFamily="var(--dt-font-mono)" fontWeight="600">
                  {LANG_DISPLAY[l.language] ?? l.language}
                </text>
                {l.played ? (
                  <>
                    <text x={tx + 12} y={ty + 37} fontSize="14" fontWeight="700"
                      fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">
                      {Math.round(l.totalCore).toLocaleString()}
                      <tspan fontSize="9" fill="var(--dt-text-3)"> CORE</tspan>
                    </text>
                    <text x={tx + tw - 12} y={ty + 37} textAnchor="end" fontSize="11"
                      fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">
                      {l.snippetCount} {t('snippets')}
                    </text>
                  </>
                ) : (
                  <text x={tx + 12} y={ty + 30} fontSize="11"
                    fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">
                    플레이 기록 없음
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

// ─── WpmTrendCard (Monthly) ───────────────────────────────────────────────────
interface WpmTrendCardProps {
  data: UserWpmHistoryResponse | null;
  loading: boolean;
}

const WpmTrendCard = ({ data, loading }: WpmTrendCardProps) => {
  const t = useT();
  const [hi, setHi] = useState<number | null>(null);
  const results = data?.results ?? [];
  const w = 980, h = 160, pad = 10, base = h - 20;

  if (loading) return <CardSkeleton height={260} />;

  const hasData = results.length >= 2 && results.some(r => r.avgWpm > 0);
  const vals = results.map(r => r.avgWpm);
  const minV  = hasData ? Math.min(...vals) - 6 : 0;
  const maxV  = hasData ? Math.max(...vals) + 6 : 100;
  const best  = hasData ? Math.max(...vals) : 0;
  const xs = results.map((_, i) => (i / (results.length - 1)) * (w - 2 * pad) + pad);
  const ys = vals.map(v => base - ((v - minV) / (maxV - minV || 1)) * (base - pad));
  const line = results.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = hasData ? `${line} L ${xs[xs.length-1]} ${base} L ${xs[0]} ${base} Z` : '';

  return (
    <div className="dt-card p-0 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-dt-border/50">
        <div className="flex flex-col gap-1">
          <span className="dt-h3 m-0">{t('Monthly WPM')}</span>
          <span className="dt-caption">{t('Last 6 months · monthly average')}</span>
        </div>
        {hasData && (
          <div className="flex items-baseline gap-[6px]">
            <span className="dt-mono tabular-nums text-[16px] text-dt-primary">{best.toFixed(1)}</span>
            <span className="dt-caption">{t('best')} WPM</span>
          </div>
        )}
      </div>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-[10px]" style={{ minHeight: 220 }}>
          <span className="text-[28px] leading-none">⚡</span>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-dt-text-2 mb-[3px]">WPM 히스토리가 여기 표시됩니다</p>
            <p className="text-[11px] text-dt-text-3">매달 평균 WPM으로 실력 향상을 트래킹합니다</p>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-4 pb-0 flex items-end">
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
            {results.map((r, i) => (
              <g key={i}>
                <circle cx={xs[i]} cy={ys[i]} r={hi === i ? 6 : 3} fill="var(--dt-primary)" />
                <text x={xs[i]} y={h-4} textAnchor="middle" fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{r.month}</text>
                <rect x={xs[i] - (w / results.length) / 2} y={0} width={w / results.length} height={base} fill="transparent"
                  onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(prev => prev === i ? null : prev)} />
              </g>
            ))}
            {hi !== null && (() => {
              const tw = 120, tx = Math.min(Math.max(xs[hi]-tw/2, 4), w-tw-4), ty = Math.max(ys[hi]-60, 6);
              return (
                <g pointerEvents="none">
                  <rect x={tx} y={ty} width={tw} height={48} rx={8} fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="1" />
                  <text x={tx+12} y={ty+19} fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{results[hi].month}</text>
                  <text x={tx+12} y={ty+37} fontSize="15" fontWeight="600" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)">{results[hi].avgWpm.toFixed(1)} <tspan fontSize="9" fill="var(--dt-text-3)">WPM</tspan></text>
                </g>
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
};

// ─── MyPage ───────────────────────────────────────────────────────────────────
const MyPage = () => {
  const userId = useUserStore((s) => s.userId);
  const [streak,   setStreak]   = useState<UserStreakResponse | null>(null);
  const [wpm,      setWpm]      = useState<UserWpmHistoryResponse | null>(null);
  const [core,     setCore]     = useState<UserCoreResponse | null>(null);
  const [byLang,   setByLang]   = useState<UserCoreByLangResponse | null>(null);
  const [coreHist, setCoreHist] = useState<UserCoreHistoryResponse | null>(null);

  const [loadingStreak,   setLoadingStreak]   = useState(true);
  const [loadingWpm,      setLoadingWpm]      = useState(true);
  const [loadingCore,     setLoadingCore]     = useState(true);
  const [loadingByLang,   setLoadingByLang]   = useState(true);
  const [loadingCoreHist, setLoadingCoreHist] = useState(true);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      getUserStreak(undefined, 'recent').then(setStreak).finally(() => setLoadingStreak(false)),
      getUserWpmHistory().then(setWpm).finally(() => setLoadingWpm(false)),
      getUserCore().then(setCore).finally(() => setLoadingCore(false)),
      getUserCoreByLanguage().then(setByLang).finally(() => setLoadingByLang(false)),
      getUserCoreHistory().then(setCoreHist).finally(() => setLoadingCoreHist(false)),
    ]);
  }, [userId]);

  const handleYearChange = (year: number) => {
    setLoadingStreak(true);
    const p = year === -1
      ? getUserStreak(undefined, 'recent')
      : getUserStreak(year);
    p.then(setStreak).finally(() => setLoadingStreak(false));
  };

  return (
    <>
      <BannerSection />
      <div className="dt-page" style={{ paddingTop: 0 }}>
      <ProfileInfoSection coreData={core} />
      <StreakCard data={streak} loading={loadingStreak} onYearChange={handleYearChange} />

      <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
        <CoreDetailCard data={core} loading={loadingCore} />
        <LanguageStatsCard data={byLang} loading={loadingByLang} />
      </div>

      <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <CoreGrowthCard data={coreHist} loading={loadingCoreHist} />
        <LanguageRadarCard data={byLang} loading={loadingByLang} />
      </div>

      <div className="mt-5">
        <WpmTrendCard data={wpm} loading={loadingWpm} />
      </div>
    </div>
    </>
  );
};

export default MyPage;
