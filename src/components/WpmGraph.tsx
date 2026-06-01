interface WpmPoint { second: number; wpm: number }
interface TypoMarker { second: number }

interface Props {
  data: WpmPoint[];
  typoMarkers?: TypoMarker[];
  height?: number;
}

const WpmGraph = ({ data, typoMarkers = [], height = 100 }: Props) => {
  if (!data.length) return null;

  const maxWpm = Math.max(...data.map((d) => d.wpm), 1);
  const n = data.length;

  const toY = (wpm: number) => height - 4 - ((wpm / maxWpm) * (height - 20));
  const toX = (i: number) => ((i + 0.5) / n) * 100;

  const linePoints = data.map((d, i) => `${toX(i)},${toY(d.wpm)}`).join(' ');
  const fillPoints = `0,${height} ${linePoints} ${toX(n - 1)},${height}`;

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="wpm-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1="0" x2="100"
            y1={height - 4 - ratio * (height - 20)}
            y2={height - 4 - ratio * (height - 20)}
            stroke="var(--dt-border)" strokeWidth="0.3" />
        ))}

        {/* fill */}
        <polygon points={fillPoints} fill="url(#wpm-fill)" />

        {/* wpm line */}
        <polyline points={linePoints} fill="none" stroke="var(--dt-primary)" strokeWidth="1.2" strokeLinejoin="round" />

        {/* typo X markers */}
        {typoMarkers.map((m, i) => {
          const secIdx = Math.min(m.second - 1, n - 1);
          const x = toX(secIdx);
          const y = toY(data[secIdx]?.wpm ?? 0);
          return (
            <g key={i}>
              <line x1={x - 1.2} y1={y - 1.2} x2={x + 1.2} y2={y + 1.2} stroke="var(--dt-error)" strokeWidth="1.2" />
              <line x1={x + 1.2} y1={y - 1.2} x2={x - 1.2} y2={y + 1.2} stroke="var(--dt-error)" strokeWidth="1.2" />
            </g>
          );
        })}

        {/* dots on line */}
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.wpm)} r="0.8" fill="var(--dt-primary)" />
        ))}
      </svg>

      {/* y labels */}
      <div style={{ position: 'absolute', top: 2, left: 0, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', lineHeight: 1 }}>
        {Math.round(maxWpm)}
      </div>
      <div style={{ position: 'absolute', bottom: 2, left: 0, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', lineHeight: 1 }}>
        0
      </div>
    </div>
  );
};

export default WpmGraph;
