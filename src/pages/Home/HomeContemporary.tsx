import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import Avatar from '@/components/Avatar';
import { formatCore } from '@/utils/formatCore';
import UserHover from '@/components/UserHover';
import { IconPlay, IconUser, IconCode } from '@/components/icons/Icons';
import { LANG_ICON } from '@/data';
import { getSoloLeaderboard } from '@/apis/leaderboardApi';
import type { SoloLeaderboardEntry } from '@/apis/leaderboardApi';
import coreLogo from '@/assets/core-logo.png';
import { getDailyChallenge } from '@/apis/dailyChallengeApi';
import type { DailyChallengeDto } from '@/apis/dailyChallengeApi';
import { useUserStore } from '@/stores/userStore';

// ─── Profile strip ────────────────────────────────────────────────────────────

const HomeProfileStrip = () => {
  const username = useUserStore((s) => s.username);
  const profileUrl = useUserStore((s) => s.profileUrl);
  const bannerUrl = useUserStore((s) => s.bannerUrl);
  const totalCore = useUserStore((s) => s.totalCore);
  const currentStreak = useUserStore((s) => s.currentStreak);
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', flex: 1, minWidth: 0 }}>
      <div style={{ position: 'relative', height: 76 }}>
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(120deg, rgba(46,107,255,0.18) 0%, rgba(87,229,255,0.08) 100%)',
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(7,11,20,0.82) 0%, rgba(7,11,20,0.45) 50%, rgba(7,11,20,0.65) 100%)',
        }} />
        {/* Identity left */}
        <div style={{
          position: 'absolute', left: 16, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 2,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'rgba(16,26,45,0.6)', backdropFilter: 'blur(8px)',
            boxShadow: 'inset 0 0 0 2px var(--dt-primary), 0 6px 18px -8px rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
          }}>
            <Avatar handle={username ?? ''} size={46} src={profileUrl} />
          </div>
          <div className="dt-stack" style={{ gap: 5 }}>
            <h1 style={{
              margin: 0, fontFamily: 'var(--dt-font-mono)', fontWeight: 700,
              fontSize: 19, lineHeight: 1, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.7)',
            }}>{username}</h1>
            {currentStreak > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                color: 'var(--dt-warning)', background: 'rgba(255,184,108,0.18)',
                boxShadow: 'inset 0 0 0 1px rgba(255,184,108,0.4)',
                width: 'fit-content',
              }}>🔥 {currentStreak}</span>
            )}
          </div>
        </div>
        {/* CORE right */}
        <div style={{
          position: 'absolute', right: 16, top: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', zIndex: 2,
        }}>
          <div className="dt-tabular" style={{
            fontFamily: 'var(--dt-font-mono)', fontWeight: 700, fontSize: 28, lineHeight: 0.9,
            color: '#fff', textShadow: '0 3px 16px rgba(0,0,0,0.6)',
          }}>{formatCore(totalCore)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginTop: 3 }}><img src={coreLogo} style={{ width: 15, height: 15, objectFit: 'contain' }} />CORE</div>
        </div>
      </div>
    </div>
  );
};

// ─── Streak card ─────────────────────────────────────────────────────────────

const CurrentStreakCard = () => {
  const t = useT();
  const currentStreak = useUserStore((s) => s.currentStreak);
  return (
    <div style={{
      position: 'relative', height: '100%', minHeight: 0, minWidth: 0,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 4px',
    }}>
      <span style={{ fontSize: 54, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 4px 16px rgba(255,107,44,0.5))' }}>🔥</span>
      <div className="dt-stack" style={{ gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--dt-text-2)' }}>{t('Streak')}</span>
        <span style={{ fontFamily: 'var(--dt-font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1, color: 'var(--dt-text)' }}>
          <span className="dt-tabular">{currentStreak}</span> {t('Day')}
        </span>
      </div>
    </div>
  );
};

// ─── Arena leaderboard ───────────────────────────────────────────────────────

const ArenaLeaderboard = ({ focus, navigate }: { focus: string; navigate: (r: string) => void }) => {
  const t = useT();
  const isBattle = focus === 'battle';
  const accent = isBattle ? '#B93CFF' : '#57E5FF';
  const [soloRows, setSoloRows] = useState<SoloLeaderboardEntry[]>([]);

  useEffect(() => {
    if (!isBattle) {
      getSoloLeaderboard(1, 6)
        .then(res => setSoloRows(res.entries))
        .catch(() => setSoloRows([]));
    }
  }, [isBattle]);

  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: 'inset 0 -1px 0 var(--dt-border)',
      }}>
        <span style={{ fontSize: 16 }}>{isBattle ? '⚔️' : '🎯'}</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--dt-text)' }}>
          {isBattle ? t('Battle ranking') : t('Solo ranking')}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          padding: '3px 10px', borderRadius: 999, color: accent,
          background: `color-mix(in oklab, ${accent} 16%, transparent)`,
        }}>{isBattle ? t('by rating') : t('by CORE')}</span>
      </div>

      <div style={{ flex: 1, padding: '6px 8px' }}>
        {soloRows.map((r, i) => (
          <div key={r.userId} style={{
            display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10,
            alignItems: 'center', padding: '8px 12px', borderRadius: 10,
            background: r.isMe ? `color-mix(in oklab, ${accent} 10%, transparent)` : 'transparent',
          }}>
            <span className="dt-mono" style={{
              fontSize: 13, fontWeight: 600, textAlign: 'center',
              color: i < 3 ? accent : 'var(--dt-text-3)',
            }}>{i + 1}</span>
            <UserHover handle={r.username}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <Avatar handle={r.username} hue={(r.username.charCodeAt(0) * 7) % 360} size={24} src={r.profileUrl ?? undefined} />
                <span className="dt-mono" style={{
                  fontSize: 13, color: r.isMe ? accent : 'var(--dt-text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {r.username}{r.isMe && ' (you)'}
                </span>
              </div>
            </UserHover>
            <span className="dt-mono dt-tabular" style={{ fontSize: 14, fontWeight: 600, color: 'var(--dt-text)' }}>
              {formatCore(r.totalCore)}
            </span>
          </div>
        ))}
        {soloRows.length === 0 && !isBattle && (
          <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: 13, color: 'var(--dt-text-3)' }}>
            기록이 없습니다.
          </div>
        )}
      </div>

      <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={() => navigate('/ranking')}
        style={{ margin: 14, marginTop: 4 }}>
        {t('View full ranking')} →
      </button>
    </div>
  );
};

// ─── Arena box ───────────────────────────────────────────────────────────────

interface ArenaBoxProps {
  navigate: (r: string) => void;
  to: string;
  bg: string;
  glow: string;
  accent: string;
  title: string;
  desc: string;
  tags: { label: string; color: string; icon?: string; user?: boolean }[];
  onHover?: () => void;
  onActivate?: () => void;
  comingSoon?: boolean;
}

const ArenaBox = ({ navigate, to, bg, glow, accent, title, desc, tags, onHover, onActivate, comingSoon }: ArenaBoxProps) => {
  const t = useT();
  const [hover, setHover] = useState(false);
  const interactive = !comingSoon;
  const glowFaint = glow.replace(/[\d.]+\)$/, '0.12)');
  const glowSheen = glow.replace(/[\d.]+\)$/, '0.16)');

  return (
    <button
      onClick={() => { if (!interactive) return; onActivate ? onActivate() : navigate(to); }}
      onMouseEnter={() => { if (interactive) { setHover(true); onHover?.(); } }}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        border: 0, cursor: interactive ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left',
        borderRadius: 'var(--dt-radius-md)',
        minHeight: 150, padding: 0, flex: 1,
        background: `linear-gradient(120deg, color-mix(in oklab, var(--dt-card) 72%, transparent) 0%, ${glowFaint} 100%)`,
        backdropFilter: 'blur(14px) saturate(1.4)', WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        boxShadow: hover
          ? `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1.5px ${accent}, 0 26px 64px -24px ${glow}`
          : `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px var(--dt-border), 0 16px 44px -28px ${glow}`,
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        display: 'flex', alignItems: 'center',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        filter: comingSoon ? 'grayscale(1) brightness(0.55)' : 'none',
        opacity: comingSoon ? 0.6 : 1,
        transition: 'filter 220ms ease',
      }}>
        <img src={bg} alt="" style={{
          position: 'absolute', right: 0, top: '50%',
          height: '116%', width: 'auto', maxWidth: '44%', objectFit: 'contain',
          transform: hover ? 'translateY(-50%) scale(1.05)' : 'translateY(-50%) scale(1)',
          transition: 'transform 600ms cubic-bezier(.2,.6,.2,1)',
          filter: `drop-shadow(0 12px 30px ${glow})`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(90% 120% at 0% 50%, ${glowSheen}, transparent 60%)`,
          opacity: hover ? 1 : 0, transition: 'opacity 220ms ease',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '22px 26px', maxWidth: '64%' }}>
          <h3 style={{
            margin: 0, fontFamily: 'var(--dt-font-display)', fontWeight: 800,
            fontSize: 30, letterSpacing: '0.02em', lineHeight: 1,
            background: 'linear-gradient(100deg, #2E6BFF 0%, #57E5FF 14%, #7A4CFF 45%, #B93CFF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>{title}</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--dt-text-2)', maxWidth: 220 }}>{desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {tags.map((tag, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 9,
                fontSize: 12, fontWeight: 600,
                color: tag.color, background: `color-mix(in oklab, ${tag.color} 16%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tag.color} 40%, transparent)`,
              }}>
                {tag.icon && <span style={{ fontSize: 12 }}>{tag.icon}</span>}
                {tag.user && <IconUser size={12} />}
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {comingSoon && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--dt-font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '0.04em',
            color: '#FFFFFF', textShadow: '0 2px 16px rgba(0,0,0,0.6)',
          }}>{title}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '7px 16px', borderRadius: 999,
            fontSize: 13, fontWeight: 600, color: '#FFFFFF',
            background: 'rgba(255,255,255,0.12)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.28)',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFB547' }} />
            {t('Coming soon')}
          </span>
        </div>
      )}
    </button>
  );
};

// ─── Mode arena ──────────────────────────────────────────────────────────────

const ModeArena = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  const [focus, setFocus] = useState('solo');
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18,
      marginTop: 28, alignItems: 'stretch',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ArenaBox
          navigate={navigate}
          to="/battle"
          bg="/assets/vs.png"
          glow="rgba(185,60,255,0.55)"
          accent="#B93CFF"
          title="BATTLE"
          desc={t('Race other devs in real time.')}
          comingSoon
          tags={[{ label: t('Most popular'), color: '#FF7A3C', icon: '🔥' }]}
        />
        <ArenaBox
          navigate={navigate}
          to="/solo"
          bg="/assets/solo.png"
          glow="rgba(46,107,255,0.55)"
          accent="#57E5FF"
          title="SOLO"
          desc={t('Practice random snippets.')}
          onHover={() => setFocus('solo')}
          onActivate={() => navigate('/solo')}
          tags={[{ label: t('Singleplayer'), color: '#57E5FF', user: true }]}
        />
      </div>
      <ArenaLeaderboard focus={focus} navigate={navigate} />
    </div>
  );
};

// ─── Daily challenge section ──────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  easy: '#3DD68C',
  medium: '#57E5FF',
  hard: '#B93CFF',
};

const DailyChallengeSection = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  const [daily, setDaily] = useState<DailyChallengeDto | null>(null);

  useEffect(() => {
    getDailyChallenge().then(setDaily).catch(() => {});
  }, []);

  if (!daily) {
    return (
      <section style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '0 4px' }}>
          <div className="animate-pulse" style={{ height: 20, width: 160, borderRadius: 6, background: 'var(--dt-hover)' }} />
          <div className="animate-pulse" style={{ height: 14, width: 80, borderRadius: 6, background: 'var(--dt-hover)', marginLeft: 'auto' }} />
        </div>
        <div className="dt-card p-0 overflow-hidden animate-pulse" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 200 }}>
          <div style={{ background: 'var(--dt-hover)', borderRight: '1px solid var(--dt-border)' }} />
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[100, 90, 80, 70, 60].map((w, i) => (
              <div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 4, background: 'var(--dt-hover)' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const ch = daily.snippet;
  const diffColor = DIFF_COLOR[ch.difficulty] || '#57E5FF';
  const diffLabel = ch.difficulty.charAt(0).toUpperCase() + ch.difficulty.slice(1);
  const langKey = ch.language.toLowerCase();
  const langIcon = LANG_ICON[langKey];

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '0 4px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--dt-font-display)', fontWeight: 600, fontSize: 20, color: 'var(--dt-text)' }}>
          {t("Today's challenge")}
        </h2>
        <span className="dt-caption" style={{ marginLeft: 'auto' }}>{daily.date}</span>
      </div>

      <div className="dt-card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
        {/* Left: language art */}
        <button
          onClick={() => navigate('/daily')}
          style={{
            position: 'relative', border: 0, cursor: 'pointer', textAlign: 'left',
            padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: `linear-gradient(150deg, color-mix(in oklab, ${diffColor} 20%, transparent) 0%, transparent 70%)`,
            boxShadow: 'inset -1px 0 0 var(--dt-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {langIcon
              ? <img src={langIcon} alt={ch.language} style={{ width: 48, height: 48, objectFit: 'contain' }} />
              : <IconCode size={48} style={{ color: diffColor }} />}
            <div className="dt-stack" style={{ gap: 2 }}>
              <span style={{ fontFamily: 'var(--dt-font-display)', fontWeight: 700, fontSize: 24, color: 'var(--dt-text)', lineHeight: 1 }}>
                {ch.language}
              </span>
            </div>
          </div>

          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '4px 12px', borderRadius: 999, marginBottom: 14,
              fontSize: 12, fontWeight: 600,
              color: diffColor, background: `color-mix(in oklab, ${diffColor} 16%, transparent)`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: diffColor }} />
              {t(diffLabel)}
            </span>
            <p className="dt-caption" style={{ margin: '0 0 16px' }}>
              {t('One snippet, one attempt.')}
            </p>
            <span className="dt-btn dt-btn-primary" style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <IconPlay size={14} /> {t('Take the challenge')}
            </span>
          </div>
        </button>

        {/* Right: code preview */}
        <div style={{ padding: '24px 28px', overflow: 'hidden' }}>
          <pre style={{
            margin: 0, fontFamily: 'var(--dt-font-mono)', fontSize: 14, lineHeight: 1.75,
            color: 'var(--dt-text)', whiteSpace: 'pre', overflowX: 'auto',
          }}>{ch.content}</pre>
        </div>
      </div>
    </section>
  );
};

// ─── Guest banner ─────────────────────────────────────────────────────────────

const GuestBanner = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 76 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(7,11,20,0.92) 0%, rgba(7,11,20,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconUser size={20} style={{ color: 'var(--dt-text-3)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--dt-font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--dt-text)', lineHeight: 1.2 }}>
                {t('Guest')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dt-text-3)', marginTop: 3 }}>
                {t('Sign in to track your streak and CORE')}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#24292F', color: '#fff',
              padding: '8px 16px', border: 0, borderRadius: 8,
              cursor: 'pointer', fontFamily: 'var(--dt-font-mono)',
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {t('Sign in with GitHub')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── HomeContemporary ─────────────────────────────────────────────────────────

const HomeContemporary = () => {
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  return (
    <div style={{
      maxWidth: 1100, margin: '0 auto', padding: '20px 44px 40px',
      minHeight: 'calc(100vh - 24px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <HomeProfileStrip />
          </div>
          <div style={{ width: 240, flexShrink: 0 }}>
            <CurrentStreakCard />
          </div>
        </div>
      ) : (
        <GuestBanner navigate={navigate} />
      )}
      <ModeArena navigate={navigate} />
      <DailyChallengeSection navigate={navigate} />
    </div>
  );
};

export default HomeContemporary;
