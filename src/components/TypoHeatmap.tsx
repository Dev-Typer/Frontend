import type { TypoData, ReplayEvent } from '@/types';
import { useState, useEffect, useRef } from 'react';

interface Props {
  content: string;
  typos: TypoData[];
  replayData: ReplayEvent[];
}

const TypoHeatmap = ({ content, typos, replayData }: Props) => {
  const typoSet = new Set(typos.map((t) => t.index));
  const [playing, setPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = () => {
    setReplayIndex(-1);
    setPlaying(true);
    let i = 0;
    const step = () => {
      if (i >= replayData.length) { setPlaying(false); return; }
      setReplayIndex(i);
      const delay = i + 1 < replayData.length
        ? Math.max(replayData[i + 1].timestamp - replayData[i].timestamp, 8)
        : 200;
      timerRef.current = setTimeout(() => { i++; step(); }, delay);
    };
    step();
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setReplayIndex(-1);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isReplaying = replayIndex >= 0;
  const typedLength = isReplaying ? replayIndex + 1 : content.length;

  return (
    <div>
      {/* Replay Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={playing ? stop : play} style={{ minWidth: 80 }}>
          {playing ? '■ 정지' : '▶ 리플레이'}
        </button>
        {isReplaying && (
          <div style={{ flex: 1, height: 3, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((replayIndex + 1) / replayData.length) * 100}%`, background: 'var(--dt-primary)', borderRadius: 999, transition: 'width 80ms linear' }} />
          </div>
        )}
        <span className="dt-caption" style={{ color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>
          {typos.length} 오타
        </span>
      </div>

      {/* Snippet with highlights */}
      <div className="dt-code-area" style={{ fontSize: 15, lineHeight: 1.85, position: 'relative' }}>
        {content.split('').map((ch, i) => {
          const isTypo = typoSet.has(i);
          const isCurrent = isReplaying && i === replayIndex;
          const isPast = isReplaying ? i < typedLength : true;
          const replayEvent = isReplaying && i < replayData.length ? replayData[i] : null;
          const replayCorrect = replayEvent ? replayEvent.correct : null;

          let color = 'inherit';
          let bg = 'transparent';
          let boxShadow = 'none';

          if (isReplaying) {
            if (isPast) {
              color = replayCorrect !== false ? 'var(--dt-type-correct)' : 'var(--dt-type-error)';
              if (!replayCorrect && replayCorrect !== null) bg = 'rgba(255,85,85,0.12)';
            }
          } else {
            if (isTypo) {
              color = 'var(--dt-error)';
              bg = 'rgba(220,38,38,0.15)';
              boxShadow = 'inset 0 0 0 1px rgba(220,38,38,0.4)';
            } else {
              color = 'var(--dt-type-correct)';
            }
          }

          if (isCurrent) {
            boxShadow = 'inset 0 0 0 1.5px var(--dt-primary)';
            bg = 'rgba(80,250,123,0.12)';
          }

          const style: React.CSSProperties = { color, background: bg, boxShadow, borderRadius: 2, position: 'relative' };

          if (ch === '\n') return <span key={i}><span className="ch" style={style}>{' '}</span>{'\n'}</span>;
          return <span key={i} className="ch" style={style}>{ch}</span>;
        })}
      </div>
    </div>
  );
};

export default TypoHeatmap;
