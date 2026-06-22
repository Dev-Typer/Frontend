import { useState } from 'react';
import { GLOBAL_RANKING } from '@/data';
import Avatar from './Avatar';

interface Props {
  handle: string;
  tier?: string;
  children: React.ReactNode;
}

function userHue(handle: string): number {
  return (String(handle).charCodeAt(0) * 7) % 360;
}

const UserHover = ({ handle, children }: Props) => {
  const [show, setShow] = useState(false);
  const row = GLOBAL_RANKING.find(r => r.handle === handle) || {} as (typeof GLOBAL_RANKING)[0] & { totalCore?: number };
  const hue = userHue(handle);
  const core = (row as any).totalCore || (2400 + ((handle.charCodeAt(1) || 5) * 31));
  const wpm = row.wpm || (90 + (handle.length * 3) % 60);
  const streak = 4 + (handle.charCodeAt(0) % 22);
  const rank = row.rank;

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, zIndex: 200,
          width: 260, borderRadius: 14, overflow: 'hidden',
          background: 'var(--dt-card)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px var(--dt-border), 0 20px 50px -16px rgba(0,0,0,0.7)',
          fontFamily: 'var(--dt-font-sans)', textAlign: 'left',
          animation: 'dt-rise 140ms ease-out',
        }}>
          <div style={{
            height: 64, position: 'relative',
            background: `linear-gradient(120deg, oklch(55% 0.18 ${hue}deg) 0%, oklch(42% 0.16 ${(hue + 40) % 360}deg) 100%)`,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(255,255,255,0.25), transparent 60%)' }}/>
          </div>
          <div style={{ padding: '0 16px 16px', marginTop: -26 }}>
            <Avatar handle={handle} hue={hue} size={52} ring="var(--dt-card)"/>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dt-mono" style={{ fontSize: 15, fontWeight: 600, color: 'var(--dt-text)' }}>{handle}</span>
              {rank && <span className="dt-mono" style={{ fontSize: 12, color: 'var(--dt-text-3)' }}>#{rank}</span>}
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 16, color: 'var(--dt-primary)', fontWeight: 600 }}>{core.toLocaleString()}</span>
              </div>
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>wpm</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 16, color: 'var(--dt-text)', fontWeight: 600 }}>{wpm}</span>
              </div>
              <div className="dt-stack" style={{ gap: 1 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>streak</span>
                <span className="dt-mono dt-tabular" style={{ fontSize: 16, color: 'var(--dt-warning)', fontWeight: 600 }}>🔥{streak}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default UserHover;
