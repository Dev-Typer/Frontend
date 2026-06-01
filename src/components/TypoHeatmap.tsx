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
  const [replayStep, setReplayStep] = useState(-1); // replayData 배열 인덱스
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        ? Math.max(replayData[i + 1].timestamp - replayData[i].timestamp, 8)
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          className="dt-btn dt-btn-secondary dt-btn-sm"
          onClick={playing ? stop : play}
          disabled={replayData.length === 0}
          style={{ minWidth: 88 }}
        >
          {playing ? '■ 정지' : '▶ 리플레이'}
        </button>

        {isReplaying && (
          <div style={{ flex: 1, height: 3, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--dt-primary)', borderRadius: 999, transition: 'width 60ms linear' }} />
          </div>
        )}

        <span className="dt-caption" style={{ color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', fontSize: 11, whiteSpace: 'nowrap' }}>
          {isReplaying
            ? `${replayStep + 1} / ${replayData.length}`
            : `${typos.length}개 오타`}
        </span>
      </div>

      {/* Snippet with highlights */}
      <div className="dt-code-area" style={{ fontSize: 15, lineHeight: 1.85 }}>
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
