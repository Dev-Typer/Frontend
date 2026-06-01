interface WpmPoint { second: number; wpm: number }

interface Props {
  data: WpmPoint[];
  height?: number;
}

const WpmGraph = ({ data, height = 80 }: Props) => {
  if (!data.length) return null;

  const maxWpm = Math.max(...data.map((d) => d.wpm), 1);

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wpm-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* fill area */}
        <polyline
          fill="url(#wpm-grad)"
          stroke="none"
          points={[
            '0,' + height,
            ...data.map((d, i) => `${i + 0.5},${height - (d.wpm / maxWpm) * (height - 4)}`),
            data.length + ',' + height,
          ].join(' ')}
        />
        {/* line */}
        <polyline
          fill="none"
          stroke="var(--dt-primary)"
          strokeWidth="1.5"
          points={data.map((d, i) => `${i + 0.5},${height - (d.wpm / maxWpm) * (height - 4)}`).join(' ')}
        />
      </svg>
      {/* y-axis label */}
      <div style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>
        {maxWpm} wpm
      </div>
    </div>
  );
};

export default WpmGraph;
