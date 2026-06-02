interface WpmPoint { second: number; wpm: number }
interface TypoMarker { second: number }

interface Props {
  wpmData: WpmPoint[];
  rawWpmData?: number[];
  typoMarkers?: TypoMarker[];
}

const W = 900;
const H = 260;
const PAD = { t: 20, b: 36, l: 48, r: 20 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

const WpmGraph = ({ wpmData, rawWpmData = [], typoMarkers = [] }: Props) => {
  if (!wpmData.length) return null;

  const n = wpmData.length;
  const allVals = [...wpmData.map((d) => d.wpm), ...rawWpmData, 0];
  const maxVal = Math.max(...allVals) * 1.12;

  const cx = (i: number) => PAD.l + ((i + 0.5) / n) * IW;
  const cy = (v: number) => PAD.t + IH - (v / maxVal) * IH;

  // y 눈금 4개
  const yTicks = [0, 1, 2, 3].map((i) => Math.round((maxVal / 3) * i));

  // 경로 생성 (smooth curve)
  const smoothPath = (pts: [number, number][]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * 0.4;
      const cp2x = pts[i][0] - (pts[i][0] - pts[i - 1][0]) * 0.4;
      d += ` C ${cp1x} ${pts[i - 1][1]}, ${cp2x} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`;
    }
    return d;
  };

  const wpmPts = wpmData.map((d, i): [number, number] => [cx(i), cy(d.wpm)]);
  const rawPts = rawWpmData.map((v, i): [number, number] => [cx(i), cy(v)]);
  const wpmPath = smoothPath(wpmPts);
  const rawPath = smoothPath(rawPts);

  const fillPts = [
    [PAD.l, H - PAD.b] as [number, number],
    ...wpmPts,
    [cx(n - 1), H - PAD.b] as [number, number],
  ];
  const fillPath = `M ${fillPts.map(([x, y]) => `${x},${y}`).join(' L ')} Z`;

  // x축 레이블 — 최대 8개
  const xStep = Math.max(1, Math.floor(n / 8));
  const xLabels = wpmData.filter((_, i) => i === 0 || (i + 1) % xStep === 0 || i === n - 1);

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="wg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y축 그리드 + 레이블 */}
        {yTicks.map((val, i) => {
          const y = cy(val);
          return (
            <g key={i}>
              <line
                x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke="var(--dt-border)"
                strokeWidth={i === 0 ? 1 : 0.6}
                strokeDasharray={i === 0 ? undefined : '4,3'}
              />
              <text
                x={PAD.l - 8} y={y}
                fontSize="12" fill="var(--dt-text-3)"
                textAnchor="end" dominantBaseline="middle"
                fontFamily="var(--dt-font-mono)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X축 */}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="var(--dt-border)" strokeWidth="1" />

        {/* X축 레이블 */}
        {xLabels.map((d) => {
          const i = wpmData.indexOf(d);
          return (
            <text
              key={i}
              x={cx(i)} y={H - PAD.b + 16}
              fontSize="11" fill="var(--dt-text-3)"
              textAnchor="middle"
              fontFamily="var(--dt-font-mono)"
            >
              {d.second}s
            </text>
          );
        })}

        {/* Raw WPM 영역 (흐리게) */}
        {rawPts.length > 1 && (
          <path d={rawPath} fill="none" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.4" strokeLinejoin="round" />
        )}

        {/* WPM 채우기 */}
        <path d={fillPath} fill="url(#wg-area)" />

        {/* WPM 선 */}
        <path d={wpmPath} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Raw WPM 점 */}
        {rawPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--dt-surface)" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.6" />
        ))}

        {/* WPM 점 */}
        {wpmPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="var(--dt-primary)" stroke="var(--dt-surface)" strokeWidth="2" />
        ))}

        {/* 오타 X 마커 */}
        {typoMarkers.map((m, i) => {
          const idx = Math.min(m.second - 1, n - 1);
          if (idx < 0) return null;
          const [x, y] = wpmPts[idx];
          const s = 6;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill="rgba(220,38,38,0.12)" />
              <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} stroke="var(--dt-error)" strokeWidth="2" strokeLinecap="round" />
              <line x1={x + s} y1={y - s} x2={x - s} y2={y + s} stroke="var(--dt-error)" strokeWidth="2" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)' }}>
          <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="var(--dt-primary)" strokeWidth="2.5" /><circle cx="12" cy="5" r="3.5" fill="var(--dt-primary)" /></svg>
          WPM
        </span>
        {rawWpmData.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)' }}>
            <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.5" /></svg>
            총타수
          </span>
        )}
        {typoMarkers.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dt-error)', fontFamily: 'var(--dt-font-mono)' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>✕</span>오타
          </span>
        )}
      </div>
    </div>
  );
};

export default WpmGraph;
