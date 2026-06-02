interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  bars: Bar[];
  height?: number;
  maxBars?: number;
  unit?: string;
}

const BarChart = ({ bars, height = 120, maxBars = 20, unit = '' }: Props) => {
  if (!bars.length) return null;
  const shown = bars.slice(0, maxBars);
  const maxVal = Math.max(...shown.map((b) => b.value), 1);
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height, padding: '16px 0 0' }}>
        {shown.map((bar, i) => {
          const pct = (bar.value / maxVal) * 100;
          const color = bar.color ?? 'var(--dt-primary)';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${pct}%`, minHeight: bar.value > 0 ? 2 : 0, transition: 'height 400ms ease-out', position: 'relative' }}
                title={`${bar.label}: ${bar.value}${unit}`}
              />
              <span style={{ fontSize: 9, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', textAlign: 'center', lineHeight: 1, wordBreak: 'break-all', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
