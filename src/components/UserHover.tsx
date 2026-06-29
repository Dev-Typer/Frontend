import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { formatCore } from '@/utils/formatCore';
import { useUserStore } from '@/stores/userStore';

interface Props {
  handle: string;
  profileUrl?: string | null;
  bannerUrl?: string | null;
  children: React.ReactNode;
  stats?: {
    totalCore?: number;
    avgWpm?: number;
    currentStreak?: number;
    rank?: number;
  };
}

function userHue(h: string) { return (h.charCodeAt(0) * 7) % 360; }

const CARD_W = 240;
const CARD_H = 165; // banner(56) + body padding + avatar row + stats
const GAP    = 8;

const UserHover = ({ handle, profileUrl, bannerUrl, children, stats }: Props) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref             = useRef<HTMLSpanElement>(null);
  const navigate        = useNavigate();
  const myUsername      = useUserStore((s) => s.username);
  const isSelf          = !!myUsername && myUsername === handle;
  const hue             = userHue(handle);
  const hasStats        = stats && (stats.totalCore !== undefined || stats.avgWpm !== undefined || stats.currentStreak !== undefined);

  const open  = () => ref.current && setRect(ref.current.getBoundingClientRect());
  const close = () => setRect(null);

  useEffect(() => {
    if (!rect) return;
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [rect]);

  const card = rect && (() => {
    // 항상 트리거 위에 표시, 공간 부족 시 아래로 fallback
    const showAbove = rect.top >= CARD_H + GAP;
    let left = rect.left;
    if (left + CARD_W > window.innerWidth - 8) left = window.innerWidth - CARD_W - 8;
    if (left < 8) left = 8;

    const posStyle: React.CSSProperties = {
      position: 'fixed',
      left,
      zIndex: 99999,
      ...(showAbove
        ? { top: rect.top - GAP, transform: 'translateY(-100%)' }
        : { top: rect.bottom + GAP }),
    };

    return (
      <div
        onClick={() => navigate(isSelf ? '/profile' : `/profile/${handle}`)}
        onMouseEnter={open}
        onMouseLeave={close}
        style={{
          ...posStyle,
          width: CARD_W,
          borderRadius: 14,
          overflow: 'hidden',
          background: 'var(--dt-card)',
          cursor: 'pointer',
          boxShadow: '0 0 0 1px var(--dt-border), 0 28px 60px -16px rgba(0,0,0,0.9)',
          fontFamily: 'var(--dt-font-sans)',
          textAlign: 'left',
          animation: 'dt-rise 140ms ease-out',
        }}>

        {/* ── Banner ── */}
        <div style={{ height: 56, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {bannerUrl
            ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, oklch(52% 0.19 ${hue}) 0%, oklch(40% 0.16 ${(hue + 50) % 360}) 100%)` }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.25) 100%)' }} />
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '10px 14px 14px' }}>
          {/* 프로필 행 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar handle={handle} hue={hue} size={36} src={profileUrl ?? undefined} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className="dt-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--dt-text)', whiteSpace: 'nowrap' }}>{handle}</span>
                {isSelf && <span style={{ fontSize: 10, color: 'var(--dt-primary)', fontWeight: 700 }}>나</span>}
                {stats?.rank != null && <span className="dt-mono" style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>#{stats.rank}</span>}
              </div>
            </div>
          </div>

          {/* 스탯 */}
          {hasStats && (
            <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--dt-border)' }}>
              {stats?.totalCore !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                  <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-primary)', fontWeight: 700 }}>{formatCore(stats.totalCore)}</span>
                </div>
              )}
              {stats?.avgWpm !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>WPM</span>
                  <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-text)', fontWeight: 600 }}>{stats.avgWpm}</span>
                </div>
              )}
              {stats?.currentStreak !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>STREAK</span>
                  <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-warning)', fontWeight: 600 }}>🔥{stats.currentStreak}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  })();

  return (
    <span ref={ref} style={{ display: 'inline-flex' }}
      onMouseEnter={open}
      onMouseLeave={close}>
      {children}
      {card && createPortal(card, document.body)}
    </span>
  );
};

export default UserHover;
