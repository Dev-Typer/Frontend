import { useState, useEffect } from 'react';
import { getSnippetRanking, type RankingItem } from '@/apis/snippetResultApi';

interface Props {
  snippetId: number;
  userId: number;
  myWpm: number;
}

const SHOW_AROUND = 3; // 위아래 n개

const RankSlideWidget = ({ snippetId, userId, myWpm }: Props) => {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnippetRanking(snippetId)
      .then((res) => {
        setItems(res.items);
        const rank = res.items.findIndex((r) => r.userId === userId) + 1 || res.items.length + 1;
        setMyRank(rank);
        // 슬라이드 애니메이션 딜레이
        setTimeout(() => setEntered(true), 300);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [snippetId, userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 36, background: 'var(--dt-hover)', borderRadius: 6, animation: 'dt-pulse 1.2s ease-in-out infinite' }} />
        ))}
      </div>
    );
  }

  if (!myRank) return null;

  // 내 순위 전후 rows 추출
  const myIdx = myRank - 1;
  const start = Math.max(0, myIdx - SHOW_AROUND);
  const end   = Math.min(items.length - 1, myIdx + SHOW_AROUND);
  const visible = items.slice(start, end + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 순위 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span
          className="dt-mono"
          style={{
            fontSize: 32, fontWeight: 700, color: 'var(--dt-primary)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: entered ? 'translateY(0)' : 'translateY(20px)',
            opacity: entered ? 1 : 0,
            display: 'inline-block',
          }}
        >
          #{myRank}
        </span>
        <div
          style={{
            transition: 'all 0.6s ease',
            transitionDelay: '0.2s',
            transform: entered ? 'translateY(0)' : 'translateY(10px)',
            opacity: entered ? 1 : 0,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--dt-text-3)', lineHeight: 1 }}>현재 순위</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{ color: 'var(--dt-success)', fontSize: 14 }}>↑</span>
            <span style={{ fontSize: 12, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)' }}>{myWpm} wpm</span>
          </div>
        </div>
      </div>

      {/* 위 생략 표시 */}
      {start > 0 && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--dt-text-3)', padding: '2px 0' }}>
          ···
        </div>
      )}

      {/* 랭킹 rows */}
      {visible.map((item, i) => {
        const isMe = item.userId === userId;
        const absIdx = start + i; // 실제 인덱스 (0-based)
        // 내 row: entered 전엔 아래에서 슬라이드 업
        const delay = isMe ? 0.1 : 0.05 * i;

        return (
          <div
            key={item.userId}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px',
              borderRadius: 6,
              background: isMe
                ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)'
                : 'var(--dt-hover)',
              boxShadow: isMe ? 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 35%, transparent)' : 'none',
              transition: `all 0.55s cubic-bezier(0.34, 1.2, 0.64, 1)`,
              transitionDelay: `${delay}s`,
              transform: entered ? 'translateY(0)' : `translateY(${isMe ? 28 : 8}px)`,
              opacity: entered ? 1 : 0,
            }}
          >
            {/* 순위 */}
            <span
              className="dt-mono"
              style={{
                width: 24, fontSize: 11, textAlign: 'right', flexShrink: 0,
                color: absIdx === 0 ? 'var(--dt-warning)'
                     : absIdx === 1 ? 'var(--dt-text-2)'
                     : absIdx === 2 ? '#cd7f32'
                     : 'var(--dt-text-3)',
                fontWeight: absIdx < 3 ? 700 : 400,
              }}
            >
              #{item.rank}
            </span>

            {/* 유저명 */}
            <span
              className="dt-mono"
              style={{
                flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-2)',
                fontWeight: isMe ? 600 : 400,
              }}
            >
              {isMe ? '▶ 나' : item.username}
            </span>

            {/* WPM */}
            <span className="dt-mono" style={{ fontSize: 12, color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-3)', flexShrink: 0 }}>
              {item.wpm.toFixed(0)}
            </span>
          </div>
        );
      })}

      {/* 아래 생략 표시 */}
      {end < items.length - 1 && (
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--dt-text-3)', padding: '2px 0' }}>
          ···
        </div>
      )}
    </div>
  );
};

export default RankSlideWidget;
