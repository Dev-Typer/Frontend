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

const CARD_W = 240;

const UserHover = ({ handle, bannerUrl, children, stats }: Props) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const myUsername = useUserStore((s) => s.username);
  const isSelf = !!myUsername && myUsername === handle;
  const hue = userHue(handle);
  const hasStats = stats && (stats.totalCore !== undefined || stats.avgWpm !== undefined);

  const handleMouseEnter = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ x: r.left, y: r.top });
  };

  const handleMouseLeave = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos]);

  const card = pos && (
    <div
      onClick={() => navigate(isSelf ? '/profile' : `/profile/${handle}`)}
      onMouseEnter={() => { /* keep open */ }}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        top: pos.y - 8 > 300 ? pos.y - 8 : pos.y + 32,
        transform: pos.y - 8 > 300 ? 'translateY(-100%)' : 'none',
        left: Math.min(pos.x, window.innerWidth - CARD_W - 12),
        zIndex: 9999,
        width: CARD_W,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--dt-card)',
        cursor: 'pointer',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px var(--dt-border), 0 20px 50px -16px rgba(0,0,0,0.8)',
        fontFamily: 'var(--dt-font-sans)',
        textAlign: 'left',
        animation: 'dt-rise 140ms ease-out',
      }}>
      {/* Banner */}
      <div style={{ height: 64, position: 'relative', overflow: 'hidden' }}>
        {bannerUrl
          ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, oklch(55% 0.18 ${hue}deg) 0%, oklch(42% 0.16 ${(hue + 40) % 360}deg) 100%)` }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(255,255,255,0.18), transparent 60%)' }} />
      </div>
      <div style={{ padding: '0 16px 16px', marginTop: -22 }}>
        <Avatar handle={handle} hue={hue} size={44} ring="var(--dt-card)" />
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dt-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--dt-text)' }}>{handle}</span>
          {isSelf && <span style={{ fontSize: 10, color: 'var(--dt-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>나</span>}
          {stats?.rank && <span className="dt-mono" style={{ fontSize: 12, color: 'var(--dt-text-3)' }}>#{stats.rank}</span>}
        </div>
        {hasStats && (
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {stats?.totalCore !== undefined && (
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 15, color: 'var(--dt-primary)', fontWeight: 600 }}>{formatCore(stats.totalCore)}</span>
              </div>
            )}
            {stats?.avgWpm !== undefined && (
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>WPM</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 15, color: 'var(--dt-text)', fontWeight: 600 }}>{stats.avgWpm}</span>
              </div>
            )}
            {stats?.currentStreak !== undefined && (
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>streak</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 15, color: 'var(--dt-warning)', fontWeight: 600 }}>🔥{stats.currentStreak}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <span ref={triggerRef} style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {children}
      {card && createPortal(card, document.body)}
    </span>
  );
};

export default UserHover;
