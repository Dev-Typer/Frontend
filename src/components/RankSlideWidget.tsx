import { useState, useEffect } from 'react';
import { getSnippetRanking, type RankingItem } from '@/apis/snippetResultApi';

interface Props {
  snippetId: number;
  userId: number;
  myWpm: number;
}

const SHOW_AROUND = 2;

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
        setTimeout(() => setEntered(true), 200);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [snippetId, userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 48, background: 'var(--dt-hover)', borderRadius: 6 }} />
        ))}
      </div>
    );
  }

  if (!myRank || items.length === 0) return null;

  const myIdx = myRank - 1;
  const start = Math.max(0, myIdx - SHOW_AROUND);
  const end   = Math.min(items.length - 1, myIdx + SHOW_AROUND);
  const visible = items.slice(start, end + 1);

  return (
    <div>
      {/* 순위 요약 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span
          className="dt-mono"
          style={{
            fontSize: 40, fontWeight: 700, color: 'var(--dt-primary)', lineHeight: 1,
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: entered ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.7)',
            opacity: entered ? 1 : 0, display: 'inline-block',
          }}
        >
          #{myRank}
        </span>
        <div style={{ transition: 'opacity 0.5s ease 0.3s', opacity: entered ? 1 : 0 }}>
          <div style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>이 스니펫 순위</div>
          <div style={{ fontSize: 13, color: 'var(--dt-text-2)', fontFamily: 'var(--dt-font-mono)', marginTop: 2 }}>
            <span style={{ color: 'var(--dt-success)', marginRight: 4 }}>↑</span>{myWpm} wpm
          </div>
        </div>
        {start > 0 && (
          <span style={{ fontSize: 11, color: 'var(--dt-text-3)', marginLeft: 4 }}>···  위 {start}명 더</span>
        )}
      </div>

      {/* 가로 나열 랭킹 rows */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {start > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: 'var(--dt-text-3)', fontSize: 12, flexShrink: 0 }}>···</div>
        )}
        {visible.map((item, i) => {
          const isMe = item.userId === userId;
          const delay = i * 0.05;
          return (
            <div
              key={item.userId}
              style={{
                flex: isMe ? '0 0 auto' : '1',
                minWidth: isMe ? 100 : 80,
                padding: '10px 12px',
                borderRadius: 8,
                background: isMe
                  ? 'color-mix(in oklab, var(--dt-primary) 14%, transparent)'
                  : 'var(--dt-hover)',
                boxShadow: isMe ? 'inset 0 0 0 1.5px color-mix(in oklab, var(--dt-primary) 40%, transparent)' : 'none',
                transition: `all 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) ${delay}s`,
                transform: entered ? 'translateY(0)' : `translateY(${isMe ? 20 : 10}px)`,
                opacity: entered ? 1 : 0,
                textAlign: 'center' as const,
              }}
            >
              <div className="dt-mono" style={{ fontSize: 10, color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-3)', marginBottom: 4 }}>
                #{item.rank}
              </div>
              <div className="dt-mono" style={{ fontSize: isMe ? 13 : 12, color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-2)', fontWeight: isMe ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isMe ? '▶ 나' : item.username}
              </div>
              <div className="dt-mono" style={{ fontSize: 11, color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-3)', marginTop: 2 }}>
                {item.wpm.toFixed(0)}
              </div>
            </div>
          );
        })}
        {end < items.length - 1 && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: 'var(--dt-text-3)', fontSize: 12, flexShrink: 0 }}>···</div>
        )}
      </div>
    </div>
  );
};

export default RankSlideWidget;
