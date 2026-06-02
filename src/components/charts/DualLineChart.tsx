interface Series {
  label: string;
  data: number[];
  color: string;
}

interface Props {
  series: Series[];
  labels?: string[];
  height?: number;
  unit?: string;
}

const DualLineChart = ({ series, height = 100, unit = '' }: Props) => {
  if (!series.length || !series[0].data.length) return null;
  const n = series[0].data.length;
  const allVals = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allVals, 1);

  const toY = (v: number) => height - 4 - (v / maxVal) * (height - 20);
  const toX = (i: number, total: number) => ((i + 0.5) / total) * 100;

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`fill-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1="0" x2="100" y1={toY(maxVal * r)} y2={toY(maxVal * r)} stroke="var(--dt-border)" strokeWidth="0.3" />
        ))}

        {/* Fill + Line per series */}
        {series.map((s, si) => {
          const pts = s.data.map((v, i) => `${toX(i, n)},${toY(v)}`);
          const fill = `0,${height} ${pts.join(' ')} ${toX(n - 1, n)},${height}`;
          return (
            <g key={si}>
              <polygon points={fill} fill={`url(#fill-${si})`} />
              <polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth="1.4" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ position: 'absolute', top: 2, right: 0, display: 'flex', gap: 12 }}>
        {series.map((s, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>
            <span style={{ display: 'inline-block', width: 16, height: 2, background: s.color, borderRadius: 1 }} />{s.label}
          </span>
        ))}
      </div>

      {/* Y axis */}
      <div style={{ position: 'absolute', top: 2, left: 0, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>
        {Math.round(maxVal)}{unit}
      </div>
    </div>
  );
};

export default DualLineChart;
