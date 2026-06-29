import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { formatCore } from '@/utils/formatCore';
import { useUserStore } from '@/stores/userStore';

interface Props {
  handle: string;
  bannerUrl?: string | null;
  tier?: string;
  children: React.ReactNode;
  stats?: {
    totalCore?: number;
    avgWpm?: number;
    currentStreak?: number;
    rank?: number;
  };
}

function userHue(handle: string): number {
  return (String(handle).charCodeAt(0) * 7) % 360;
}

const CARD_W   = 240;
const CARD_H   = 210; // 배너64 + 아바타 overlap + 콘텐츠 ~ 추정 최대
const GAP      = 8;   // 트리거와의 여백

const UserHover = ({ handle, bannerUrl, children, stats }: Props) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef      = useRef<HTMLSpanElement>(null);
  const navigate        = useNavigate();
  const myUsername      = useUserStore((s) => s.username);
  const isSelf          = !!myUsername && myUsername === handle;
  const hue             = userHue(handle);
  const hasStats        = stats && (stats.totalCore !== undefined || stats.avgWpm !== undefined);

  const show = () => triggerRef.current && setRect(triggerRef.current.getBoundingClientRect());
  const hide = () => setRect(null);

  useEffect(() => {
    if (!rect) return;
    const close = () => setRect(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [rect]);

  const getCardStyle = (): React.CSSProperties => {
    if (!rect) return {};
    const spaceAbove = rect.top;
    const showAbove  = spaceAbove >= CARD_H + GAP * 2;

    // 좌우 경계 보정
    let left = rect.left;
    if (left + CARD_W > window.innerWidth - 8) left = window.innerWidth - CARD_W - 8;
    if (left < 8) left = 8;

    return {
      position: 'fixed',
      left,
      ...(showAbove
        ? { top: rect.top - GAP, transform: 'translateY(-100%)' }
        : { top: rect.bottom + GAP }
      ),
      zIndex: 9999,
      width: CARD_W,
    };
  };

  const card = rect && (
    <div
      onClick={() => navigate(isSelf ? '/profile' : `/profile/${handle}`)}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{
        ...getCardStyle(),
        borderRadius: 14,
        background: 'var(--dt-card)',
        cursor: 'pointer',
        boxShadow: '0 0 0 1px var(--dt-border), 0 24px 56px -16px rgba(0,0,0,0.85)',
        fontFamily: 'var(--dt-font-sans)',
        textAlign: 'left',
        animation: 'dt-rise 140ms ease-out',
        overflow: 'visible',
      }}>

      {/* ── Banner ── */}
      <div style={{ height: 64, borderRadius: '14px 14px 0 0', overflow: 'hidden', position: 'relative' }}>
        {bannerUrl
          ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, oklch(55% 0.18 ${hue}) 0%, oklch(42% 0.16 ${(hue + 40) % 360}) 100%)` }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(255,255,255,0.18), transparent 60%)' }} />
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '0 14px 14px', position: 'relative' }}>
        {/* 아바타 — 배너 경계에 걸쳐 배치 */}
        <div style={{ position: 'absolute', top: -22, left: 14 }}>
          <Avatar handle={handle} hue={hue} size={44} src={null} ring="var(--dt-card)" />
        </div>

        {/* 아바타 공간 확보 */}
        <div style={{ height: 26 }} />

        {/* 유저명 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span className="dt-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--dt-text)' }}>{handle}</span>
          {isSelf && <span style={{ fontSize: 10, color: 'var(--dt-primary)', fontWeight: 700, letterSpacing: '0.04em' }}>나</span>}
          {stats?.rank && <span className="dt-mono" style={{ fontSize: 12, color: 'var(--dt-text-3)' }}>#{stats.rank}</span>}
        </div>

        {/* 스탯 */}
        {hasStats && (
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {stats?.totalCore !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                <span className="dt-mono" style={{ fontSize: 15, color: 'var(--dt-primary)', fontWeight: 600 }}>{formatCore(stats.totalCore)}</span>
              </div>
            )}
            {stats?.avgWpm !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>WPM</span>
                <span className="dt-mono" style={{ fontSize: 15, color: 'var(--dt-text)', fontWeight: 600 }}>{stats.avgWpm}</span>
              </div>
            )}
            {stats?.currentStreak !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>STREAK</span>
                <span className="dt-mono" style={{ fontSize: 15, color: 'var(--dt-warning)', fontWeight: 600 }}>🔥{stats.currentStreak}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <span ref={triggerRef} style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}>
      {children}
      {card && createPortal(card, document.body)}
    </span>
  );
};

export default UserHover;
