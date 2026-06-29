import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { formatCore } from '@/utils/formatCore';
import Avatar from '@/components/Avatar';
import coreLogo from '@/assets/core-logo.png';
import {
  getPublicUserProfile,
  getPublicUserStreak,
  getPublicUserWpmHistory,
  getPublicUserCore,
  getPublicUserCoreByLanguage,
  getPublicUserCoreHistory,
  type UserMeResponse,
} from '@/apis/userApi';
import type {
  UserStreakResponse,
  UserWpmHistoryResponse,
  UserCoreResponse,
  UserCoreByLangResponse,
  UserCoreHistoryResponse,
} from '@/types';
import {
  StreakCard,
  CoreDetailCard,
  LanguageStatsCard,
  CoreGrowthCard,
  LanguageRadarCard,
  WpmTrendCard,
} from './MyPage';

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
function avatarHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

// ─── ProfileBanner ────────────────────────────────────────────────────────────
const ProfileBanner = ({ bannerUrl, username }: { bannerUrl: string | null; username: string }) => {
  const hue = avatarHue(username);
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 340 }}>
      {bannerUrl
        ? <img src={bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        : <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg,
              color-mix(in oklab, hsl(${hue}deg 70% 35%) 60%, #070C1F) 0%,
              color-mix(in oklab, hsl(${(hue + 40) % 360}deg 55% 20%) 40%, #070C1F) 60%,
              #070C1F 100%)`,
          }} />
      }
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 30%, var(--dt-bg) 100%)' }} />
    </div>
  );
};

// ─── ProfileHeader ────────────────────────────────────────────────────────────
const ProfileHeader = ({ profile, coreData }: { profile: UserMeResponse; coreData: UserCoreResponse | null }) => {
  const t = useT();
  const hue = avatarHue(profile.username);
  return (
    <div style={{ marginTop: -70 }}>
      <div className="flex items-end gap-6">
        {/* 아바타 */}
        <div style={{
          width: 120, height: 120, borderRadius: 24, overflow: 'hidden', flexShrink: 0,
          background: 'var(--dt-surface)', zIndex: 2,
          boxShadow: '0 0 0 3px var(--dt-primary), 0 0 0 5px rgba(242,58,47,0.25), 0 12px 40px -8px rgba(0,0,0,0.8)',
        }}>
          {profile.profileUrl
            ? <img src={profile.profileUrl} alt={profile.username} className="w-full h-full object-cover" />
            : <Avatar handle={profile.username} hue={hue} size={108} />
          }
        </div>

        {/* 유저명 */}
        <div className="flex-1 pb-3" style={{ zIndex: 2 }}>
          <h1 className="m-0 dt-mono font-bold leading-none" style={{ fontSize: 42, color: 'var(--dt-text)', letterSpacing: '-0.02em' }}>
            {profile.username}
          </h1>
          <div className="flex items-center gap-[10px] mt-[10px]">
            <span style={{ display: 'inline-block', width: 3, height: 14, background: 'var(--dt-primary)', borderRadius: 2 }} />
            <span className="text-[13px] text-dt-text-2">
              {t('Current streak')}: <span className="dt-mono text-dt-warning font-semibold">🔥{profile.currentStreak}</span>
            </span>
          </div>
        </div>

        {/* CORE */}
        <div className="pb-3 text-right shrink-0" style={{ zIndex: 2 }}>
          <div className="dt-label text-dt-text-3 mb-1 tracking-widest text-[10px] flex items-center gap-[4px]">
            <img src={coreLogo} style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.75 }} />
            TOTAL CORE
          </div>
          <div className="dt-mono tabular-nums font-bold leading-none"
            style={{ fontSize: 68, color: 'var(--dt-primary)', textShadow: '0 0 40px rgba(242,58,47,0.35)' }}>
            {formatCore(coreData?.totalCore ?? 0)}
          </div>
        </div>
      </div>
      <div className="mt-5 mb-4 h-px" style={{ background: 'linear-gradient(90deg, var(--dt-primary) 0%, transparent 60%)' }} />
    </div>
  );
};

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const t = useT();

  const [profile,   setProfile]   = useState<UserMeResponse | null>(null);
  const [streak,    setStreak]    = useState<UserStreakResponse | null>(null);
  const [wpm,       setWpm]       = useState<UserWpmHistoryResponse | null>(null);
  const [core,      setCore]      = useState<UserCoreResponse | null>(null);
  const [byLang,    setByLang]    = useState<UserCoreByLangResponse | null>(null);
  const [coreHist,  setCoreHist]  = useState<UserCoreHistoryResponse | null>(null);

  const [loadingProfile,   setLoadingProfile]   = useState(true);
  const [loadingStreak,    setLoadingStreak]    = useState(true);
  const [loadingWpm,       setLoadingWpm]       = useState(true);
  const [loadingCore,      setLoadingCore]      = useState(true);
  const [loadingByLang,    setLoadingByLang]    = useState(true);
  const [loadingCoreHist,  setLoadingCoreHist]  = useState(true);
  const [notFound,         setNotFound]         = useState(false);

  useEffect(() => {
    if (!username) return;
    setNotFound(false);
    setLoadingProfile(true);

    getPublicUserProfile(username)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoadingProfile(false));

    getPublicUserStreak(username, undefined, 'recent').then(setStreak).finally(() => setLoadingStreak(false));
    getPublicUserWpmHistory(username).then(setWpm).finally(() => setLoadingWpm(false));
    getPublicUserCore(username).then(setCore).finally(() => setLoadingCore(false));
    getPublicUserCoreByLanguage(username).then(setByLang).finally(() => setLoadingByLang(false));
    getPublicUserCoreHistory(username).then(setCoreHist).finally(() => setLoadingCoreHist(false));
  }, [username]);

  const handleYearChange = (year: number) => {
    if (!username) return;
    setLoadingStreak(true);
    const p = year === -1
      ? getPublicUserStreak(username, undefined, 'recent')
      : getPublicUserStreak(username, year);
    p.then(setStreak).finally(() => setLoadingStreak(false));
  };

  if (notFound) {
    return (
      <div className="dt-page flex flex-col items-center justify-center gap-5" style={{ minHeight: '60vh' }}>
        <span style={{ fontSize: 48 }}>👤</span>
        <div className="text-center">
          <h2 className="dt-h2 m-0 mb-2">{t('User not found')}</h2>
          <p className="dt-caption">@{username}</p>
        </div>
        <button className="dt-btn dt-btn-secondary" onClick={() => navigate(-1)}>{t('Go back')}</button>
      </div>
    );
  }

  if (loadingProfile && !profile) {
    return (
      <div>
        <div className="relative w-full animate-pulse" style={{ height: 340, background: 'var(--dt-hover)' }} />
        <div className="dt-page" style={{ paddingTop: 0 }}>
          <div className="animate-pulse" style={{ height: 120, marginTop: -70, background: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <ProfileBanner bannerUrl={profile.bannerUrl} username={profile.username} />
      <div className="dt-page" style={{ paddingTop: 0 }}>
        <ProfileHeader profile={profile} coreData={core} />
        <StreakCard data={streak} loading={loadingStreak} onYearChange={handleYearChange} />

        <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
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

export default ProfilePage;
