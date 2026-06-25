import { useState } from 'react';
import Avatar from './Avatar';

interface Props {
  handle: string;
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

const UserHover = ({ handle, children, stats }: Props) => {
  const [show, setShow] = useState(false);
  const hue = userHue(handle);
  const hasStats = stats && (stats.totalCore !== undefined || stats.avgWpm !== undefined);

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, zIndex: 200,
          width: 220, borderRadius: 14, overflow: 'hidden',
          background: 'var(--dt-card)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px var(--dt-border), 0 20px 50px -16px rgba(0,0,0,0.7)',
          fontFamily: 'var(--dt-font-sans)', textAlign: 'left',
          animation: 'dt-rise 140ms ease-out',
        }}>
          <div style={{
            height: 52, position: 'relative',
            background: `linear-gradient(120deg, oklch(55% 0.18 ${hue}deg) 0%, oklch(42% 0.16 ${(hue + 40) % 360}deg) 100%)`,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(255,255,255,0.25), transparent 60%)' }}/>
          </div>
          <div style={{ padding: '0 16px 16px', marginTop: -22 }}>
            <Avatar handle={handle} hue={hue} size={44} ring="var(--dt-card)"/>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dt-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--dt-text)' }}>{handle}</span>
              {stats?.rank && <span className="dt-mono" style={{ fontSize: 12, color: 'var(--dt-text-3)' }}>#{stats.rank}</span>}
            </div>
            {hasStats && (
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                {stats?.totalCore !== undefined && (
                  <div className="dt-stack" style={{ gap: 1 }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                    <span className="dt-mono dt-tabular" style={{ fontSize: 15, color: 'var(--dt-primary)', fontWeight: 600 }}>{stats.totalCore.toLocaleString()}</span>
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
      )}
    </span>
  );
};

export default UserHover;
