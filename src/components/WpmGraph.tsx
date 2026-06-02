interface WpmPoint { second: number; wpm: number }
interface TypoMarker { second: number }

interface Props {
  wpmData: WpmPoint[];
  rawWpmData?: number[];       // 초당 총타수 배열 (wpmData와 같은 길이)
  typoMarkers?: TypoMarker[];
  height?: number;
}

const WpmGraph = ({ wpmData, rawWpmData = [], typoMarkers = [], height = 140 }: Props) => {
  if (!wpmData.length) return null;

  const n = wpmData.length;
  const allVals = [
    ...wpmData.map((d) => d.wpm),
    ...rawWpmData,
  ];
  const maxVal = Math.max(...allVals, 1);
  const pad = { t: 8, b: 24, l: 36, r: 8 };
  const W = 100;
  const H = height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const toX = (i: number) => pad.l + ((i + 0.5) / n) * innerW;
  const toY = (v: number) => pad.t + innerH - (v / maxVal) * innerH;

  const wpmPts  = wpmData.map((d, i) => `${toX(i)},${toY(d.wpm)}`).join(' ');
  const rawPts  = rawWpmData.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const fillPts = `${pad.l},${H - pad.b} ${wpmPts} ${toX(n - 1)},${H - pad.b}`;

  // y축 눈금
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(maxVal * r));

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="wg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y축 그리드 + 레이블 */}
        {yTicks.map((val, i) => {
          const y = toY(val);
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                stroke="var(--dt-border)" strokeWidth="0.4" strokeDasharray={i === 0 ? '0' : '1.5,1.5'} />
              <text x={pad.l - 2} y={y + 1} fontSize="3.5" fill="var(--dt-text-3)"
                textAnchor="end" dominantBaseline="middle">{val}</text>
            </g>
          );
        })}

        {/* x축 레이블 (초) */}
        {wpmData.filter((_, i) => i % Math.max(1, Math.floor(n / 8)) === 0).map((d) => {
          const i = wpmData.indexOf(d);
          return (
            <text key={i} x={toX(i)} y={H - pad.b + 6} fontSize="3.5"
              fill="var(--dt-text-3)" textAnchor="middle">{d.second}s</text>
          );
        })}

        {/* Raw WPM 선 (흐릿하게) */}
        {rawWpmData.length > 0 && (
          <polyline
            points={rawPts}
            fill="none"
            stroke="var(--dt-text-3)"
            strokeWidth="0.8"
            strokeLinejoin="round"
            opacity="0.5"
          />
        )}

        {/* WPM fill */}
        <polygon points={fillPts} fill="url(#wg-fill)" />

        {/* WPM 선 */}
        <polyline
          points={wpmPts}
          fill="none"
          stroke="var(--dt-primary)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* WPM 점 */}
        {wpmData.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.wpm)} r="1.2"
            fill="var(--dt-primary)" />
        ))}

        {/* 오타 X 마커 */}
        {typoMarkers.map((m, i) => {
          const idx = Math.min(m.second - 1, n - 1);
          if (idx < 0) return null;
          const cx = toX(idx);
          const cy = toY(wpmData[idx]?.wpm ?? 0);
          const s = 2;
          return (
            <g key={i}>
              <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s}
                stroke="var(--dt-error)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy + s}
                stroke="var(--dt-error)" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>

      {/* 범례 */}
      <div style={{ position: 'absolute', top: 4, right: 8, display: 'flex', gap: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>
          <span style={{ display: 'inline-block', width: 14, height: 2, background: 'var(--dt-primary)', borderRadius: 1 }} />WPM
        </span>
        {rawWpmData.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>
            <span style={{ display: 'inline-block', width: 14, height: 2, background: 'var(--dt-text-3)', borderRadius: 1, opacity: 0.5 }} />총타수
          </span>
        )}
        {typoMarkers.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--dt-error)', fontFamily: 'var(--dt-font-mono)' }}>
            <span style={{ fontWeight: 700 }}>✕</span>오타
          </span>
        )}
      </div>
    </div>
  );
};

export default WpmGraph;
