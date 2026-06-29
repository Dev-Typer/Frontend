import Avatar from '@/components/Avatar';

export function getWordContext(snippet: string, typedIndex: number) {
  const tokens: { text: string; start: number; end: number }[] = [];
  let i = 0;
  while (i < snippet.length) {
    if (/\S/.test(snippet[i])) {
      const start = i;
      while (i < snippet.length && /\S/.test(snippet[i])) i++;
      tokens.push({ text: snippet.slice(start, i), start, end: i });
    } else { i++; }
  }
  let curIdx = tokens.findIndex((t) => typedIndex >= t.start && typedIndex < t.end);
  if (curIdx === -1) {
    curIdx = tokens.findIndex((t) => t.start > typedIndex);
    if (curIdx === -1) curIdx = tokens.length - 1;
  }
  const curr = tokens[curIdx];
  const prev = curIdx > 0 ? tokens[curIdx - 1] : null;
  const next = tokens[curIdx + 1] ?? null;
  const typedInCurr = curr ? Math.max(0, typedIndex - curr.start) : 0;
  return { prev, curr, next, typedInCurr, curIdx };
}

interface SoloRaceBarProps {
  progressFrac: number;
  wpm: number;
  username: string;
}

const SoloRaceBar = ({ progressFrac, wpm, username }: SoloRaceBarProps) => {
  const hue = (username.charCodeAt(0) * 7) % 360;
  const pct = Math.round(progressFrac * 100);
  return (
    <div style={{
      flexShrink: 0, marginTop: 8,
      fontFamily: 'var(--dt-font-mono)', background: 'var(--dt-type-bg)',
      borderRadius: 10, overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(120,150,255,0.12)',
    }}>
      <div style={{ padding: '7px 14px', borderBottom: '1px solid rgba(120,150,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: 10, color: 'var(--dt-text-3)', marginLeft: 4 }}>race.sh — solo</span>
        <span className="dt-live-dot" style={{ marginLeft: 'auto' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '148px 1fr 88px', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'color-mix(in oklab, var(--dt-primary) 5%, transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ color: 'var(--dt-primary)', fontSize: 12 }}>▶</span>
          <Avatar handle={username} hue={hue} size={22} ring="var(--dt-primary)" />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--dt-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {username}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, background: 'var(--dt-primary)', borderRadius: 3,
              transition: 'width 200ms ease-linear',
              boxShadow: '0 0 10px color-mix(in oklab, var(--dt-primary) 55%, transparent)',
            }} />
          </div>
          {pct < 100
            ? <span className="animate-pulse" style={{ color: 'var(--dt-primary)', fontSize: 13, lineHeight: 1, flexShrink: 0 }}>▮</span>
            : <span style={{ color: 'var(--dt-success)', fontSize: 13, flexShrink: 0 }}>✓</span>
          }
        </div>
        <div style={{ textAlign: 'right', lineHeight: 1.4 }}>
          {pct >= 100 ? (
            <span style={{ fontSize: 12, color: 'var(--dt-success)', fontWeight: 600 }}>exit 0</span>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--dt-primary)', fontWeight: 600 }}>
                {wpm} <span style={{ fontSize: 10, color: 'var(--dt-text-3)' }}>wpm</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>{pct}%</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoloRaceBar;
