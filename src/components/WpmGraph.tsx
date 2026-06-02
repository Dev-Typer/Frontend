import { useState } from 'react';

interface WpmPoint { second: number; wpm: number }
interface TypoMarker { second: number }

interface Props {
  wpmData: WpmPoint[];
  rawWpmData?: number[];
  typoMarkers?: TypoMarker[];
}

interface Tooltip {
  x: number;
  y: number;
  second: number;
  wpm: number;
  raw?: number;
}

const W = 900;
const H = 260;
const PAD = { t: 20, b: 36, l: 48, r: 20 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

const WpmGraph = ({ wpmData, rawWpmData = [], typoMarkers = [] }: Props) => {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  if (!wpmData.length) return null;

  const n = wpmData.length;
  const allVals = [...wpmData.map((d) => d.wpm), ...rawWpmData, 0];
  const maxVal = Math.max(...allVals) * 1.12;

  const cx = (i: number) => PAD.l + ((i + 0.5) / n) * IW;
  const cy = (v: number) => PAD.t + IH - (v / maxVal) * IH;

  const yTicks = [0, 1, 2, 3].map((i) => Math.round((maxVal / 3) * i));

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
  const fillPts = [[PAD.l, H - PAD.b] as [number, number], ...wpmPts, [cx(n - 1), H - PAD.b] as [number, number]];
  const fillPath = `M ${fillPts.map(([x, y]) => `${x},${y}`).join(' L ')} Z`;
  const xStep = Math.max(1, Math.floor(n / 8));

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
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
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="var(--dt-border)" strokeWidth={i === 0 ? 1 : 0.6} strokeDasharray={i === 0 ? undefined : '4,3'} />
              <text x={PAD.l - 8} y={y} fontSize="12" fill="var(--dt-text-3)" textAnchor="end" dominantBaseline="middle" fontFamily="var(--dt-font-mono)">{val}</text>
            </g>
          );
        })}

        {/* X축 */}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="var(--dt-border)" strokeWidth="1" />
        {wpmData.filter((_, i) => i === 0 || (i + 1) % xStep === 0 || i === n - 1).map((d) => {
          const i = wpmData.indexOf(d);
          return <text key={i} x={cx(i)} y={H - PAD.b + 16} fontSize="11" fill="var(--dt-text-3)" textAnchor="middle" fontFamily="var(--dt-font-mono)">{d.second}s</text>;
        })}

        {/* Raw WPM 선 */}
        {rawPts.length > 1 && <path d={rawPath} fill="none" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.4" strokeLinejoin="round" />}

        {/* WPM fill + 선 */}
        <path d={fillPath} fill="url(#wg-area)" />
        <path d={wpmPath} fill="none" stroke="var(--dt-primary)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Raw 점 */}
        {rawPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--dt-surface)" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.6" />
        ))}

        {/* WPM 점 + 호버 */}
        {wpmPts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="var(--dt-primary)" stroke="var(--dt-surface)" strokeWidth="2" />
            {/* 투명한 히트박스 — 호버 감지 영역 */}
            <circle
              cx={x} cy={y} r="16" fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setTooltip({ x, y, second: wpmData[i].second, wpm: wpmData[i].wpm, raw: rawWpmData[i] })}
            />
          </g>
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

        {/* 호버 툴팁 */}
        {tooltip && (() => {
          const bw = 110;
          const bh = tooltip.raw !== undefined ? 56 : 40;
          // SVG 좌표 → 툴팁 위치 (오른쪽 넘치면 왼쪽으로)
          const tx = tooltip.x + bw + 20 > W ? tooltip.x - bw - 8 : tooltip.x + 8;
          const ty = tooltip.y - bh / 2;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={bw} height={bh} rx="4" fill="var(--dt-card)" stroke="var(--dt-border)" strokeWidth="0.8" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))" />
              <text x={tx + 8} y={ty + 14} fontSize="10" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">{tooltip.second}초</text>
              <text x={tx + 8} y={ty + 28} fontSize="13" fill="var(--dt-primary)" fontFamily="var(--dt-font-mono)" fontWeight="700">{tooltip.wpm} WPM</text>
              {tooltip.raw !== undefined && (
                <text x={tx + 8} y={ty + 44} fontSize="11" fill="var(--dt-text-3)" fontFamily="var(--dt-font-mono)">총 {tooltip.raw} raw</text>
              )}
            </g>
          );
        })()}
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)' }}>
          <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="var(--dt-primary)" strokeWidth="2.5" /><circle cx="12" cy="5" r="3.5" fill="var(--dt-primary)" /></svg>WPM
        </span>
        {rawWpmData.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)' }}>
            <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="var(--dt-text-3)" strokeWidth="1.5" opacity="0.5" /></svg>총타수
          </span>
        )}
        {typoMarkers.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--dt-error)', fontFamily: 'var(--dt-font-mono)' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>✕</span>오타
          </span>
        )}
      </div>
    </div>
  );
};

export default WpmGraph;
