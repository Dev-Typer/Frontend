import { useState, useEffect, useRef } from 'react';
import { getSnippetReplay } from '@/apis/snippetResultApi';
import type { ReplayEvent } from '@/types';

interface Props {
  resultId: number;
  onClose: () => void;
}

const ReplayViewer = ({ resultId, onClose }: Props) => {
  const [replayData, setReplayData] = useState<ReplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getSnippetReplay(resultId)
      .then((data) => {
        setReplayData(data.replayData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resultId]);

  const play = () => {
    setCurrentIndex(-1);
    setPlaying(true);
    let i = 0;
    const step = () => {
      if (i >= replayData.length) { setPlaying(false); return; }
      setCurrentIndex(i);
      const delay = i + 1 < replayData.length
        ? replayData[i + 1].timestamp - replayData[i].timestamp
        : 200;
      timerRef.current = setTimeout(() => { i++; step(); }, Math.max(delay, 10));
    };
    step();
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
    setCurrentIndex(-1);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="dt-card" style={{ width: '100%', maxWidth: 700, maxHeight: '80vh', overflowY: 'auto', padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="dt-h3" style={{ margin: 0 }}>Replay</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, color: 'var(--dt-text-3)', fontSize: 20, cursor: 'pointer', padding: '0 4px' }}>×</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)' }}>loading...</div>
        ) : replayData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dt-text-3)' }}>리플레이 데이터가 없습니다.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button className="dt-btn dt-btn-primary" onClick={play} disabled={playing}>▶ 재생</button>
              <button className="dt-btn dt-btn-secondary" onClick={stop} disabled={!playing}>■ 정지</button>
              <span className="dt-caption" style={{ marginLeft: 8, alignSelf: 'center', color: 'var(--dt-text-3)' }}>
                {currentIndex >= 0 ? `${currentIndex + 1} / ${replayData.length}` : `${replayData.length} events`}
              </span>
            </div>

            <div className="dt-code-area" style={{ fontSize: 16, lineHeight: 1.85 }}>
              {replayData.map((event, i) => {
                const isCurrent = i === currentIndex;
                const isPast = i < currentIndex;
                const cls = ['ch',
                  isPast || isCurrent ? (event.correct ? 'correct' : 'error') : '',
                  isCurrent ? 'cursor' : '',
                ].filter(Boolean).join(' ');
                return (
                  <span key={i} className={cls}>
                    {event.char === '\n' ? (isPast || isCurrent) && !event.correct ? '↵' : ' ' : event.char}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReplayViewer;
