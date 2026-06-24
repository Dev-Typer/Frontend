import type { TypoData, ReplayEvent } from '@/types';
import { useState, useEffect, useRef, useMemo } from 'react';

interface Props {
  content: string;
  typos: TypoData[];
  replayData: ReplayEvent[];
}

const TypoHeatmap = ({ content, typos, replayData }: Props) => {
  const typoSet = useMemo(() => new Set(typos.map((t) => t.index)), [typos]);

  const [playing, setPlaying] = useState(false);
  const [replayStep, setReplayStep] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // replayStep 기준 현재 커서가 가리키는 스니펫 position
  const cursorPos = replayStep >= 0 ? replayData[replayStep]?.index ?? -1 : -1;

  // 각 스니펫 position에 대해 replay 중 가장 최근 이벤트의 correct 여부
  // replayStep까지만 처리
  const posStateMap = useMemo(() => {
    const map = new Map<number, boolean>();
    for (let i = 0; i <= replayStep && i < replayData.length; i++) {
      const e = replayData[i];
      map.set(e.index, e.correct); // 마지막 이벤트가 덮어씀
    }
    return map;
  }, [replayStep, replayData]);

  const play = () => {
    if (replayData.length === 0) return;
    setReplayStep(-1);
    setPlaying(true);

    let i = 0;
    const step = () => {
      if (i >= replayData.length) { setPlaying(false); return; }
      setReplayStep(i);
      const delay = i + 1 < replayData.length
        ? Math.max((replayData[i + 1].timestamp - replayData[i].timestamp) / speedRef.current, 8)
        : 300;
      timerRef.current = setTimeout(() => { i++; step(); }, delay);
    };
    step();
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setReplayStep(-1);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isReplaying = replayStep >= 0;
  const progress = replayData.length > 0 ? (replayStep + 1) / replayData.length : 0;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <button
          className="dt-btn dt-btn-secondary dt-btn-sm min-w-[88px]"
          onClick={playing ? stop : play}
          disabled={replayData.length === 0}
        >
          {playing ? '■ 정지' : '▶ 리플레이'}
        </button>

        {isReplaying && (
          <div className="flex-1 h-[3px] bg-dt-hover rounded-full overflow-hidden">
            <div className="h-full bg-dt-primary rounded-full transition-[width] duration-[60ms] ease-linear" style={{ width: `${progress * 100}%` }} />
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {[0.5, 1, 2, 3].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              style={{ padding: '2px 8px', borderRadius: 6, border: 0, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: speed === s ? 'color-mix(in oklab, var(--dt-primary) 18%, transparent)' : 'var(--dt-hover)',
                color: speed === s ? 'var(--dt-primary)' : 'var(--dt-text-3)',
                boxShadow: speed === s ? 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 40%, transparent)' : 'none',
              }}>
              {s}x
            </button>
          ))}
        </div>

        <span className="dt-caption text-dt-text-3 font-dt-mono text-[11px] whitespace-nowrap">
          {isReplaying
            ? `${replayStep + 1} / ${replayData.length}`
            : `${typos.length}개 오타`}
        </span>
      </div>

      {/* Snippet with highlights */}
      <div className="dt-code-area text-[15px] leading-[1.85]">
        {content.split('').map((ch, i) => {
          let color = 'inherit';
          let bg = 'transparent';
          let boxShadow = 'none';

          if (!isReplaying) {
            // 최종 결과 표시 — 오타 위치 빨간 강조
            if (typoSet.has(i)) {
              color = 'var(--dt-error)';
              bg = 'rgba(220,38,38,0.14)';
              boxShadow = 'inset 0 0 0 1px rgba(220,38,38,0.45)';
            } else {
              color = 'var(--dt-type-correct)';
            }
          } else {
            // 리플레이 모드
            if (i === cursorPos) {
              // 현재 입력 중인 위치 — 커서
              const isCorrect = posStateMap.get(i);
              color = isCorrect ? 'var(--dt-type-correct)' : 'var(--dt-type-error)';
              bg = isCorrect ? 'rgba(80,250,123,0.12)' : 'rgba(255,85,85,0.15)';
              boxShadow = 'inset 0 0 0 1.5px var(--dt-primary)';
            } else if (posStateMap.has(i)) {
              // 이미 지나간 위치
              const correct = posStateMap.get(i);
              color = correct ? 'var(--dt-type-correct)' : 'var(--dt-type-error)';
              if (!correct) bg = 'rgba(255,85,85,0.10)';
            }
            // 아직 도달하지 않은 위치는 기본 색
          }

          const style: React.CSSProperties = {
            color, background: bg, boxShadow, borderRadius: 2, position: 'relative',
          };

          if (ch === '\n') {
            return (
              <span key={i}>
                <span className="ch" style={style}>{' '}</span>
                {'\n'}
              </span>
            );
          }
          return <span key={i} className="ch" style={style}>{ch}</span>;
        })}
      </div>
    </div>
  );
};

export default TypoHeatmap;
