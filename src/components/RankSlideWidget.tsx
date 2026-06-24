import { useState, useEffect, useMemo } from 'react';
import { getSnippetRanking, type RankingItem } from '@/apis/snippetResultApi';

interface Props {
  snippetId: number;
  userId: number;
  myWpm: number;
  myUsername?: string;
}

const DUMMY_NAMES = [
  'j_maestro', 'swift_key', 'typelord', 'kb_wizard',
  'fast_coder', 'mono_king', 'syn_tap', 'ultra_dev',
  'code_ninja', 'key_storm',
];

function makeDummyWpm(myWpm: number, offset: number) {
  return Math.max(10, Math.round(myWpm + offset + (Math.random() * 6 - 3)));
}

const ROW_H = 44; // px

const RankSlideWidget = ({ snippetId, userId, myWpm, myUsername = '나' }: Props) => {
  const [realItems, setRealItems] = useState<RankingItem[]>([]);
  const [phase, setPhase] = useState<'initial' | 'rising' | 'done'>('initial');

  useEffect(() => {
    getSnippetRanking(snippetId)
      .then((res) => setRealItems(res.items))
      .catch(() => {});
  }, [snippetId]);

  // 더미 포함 최종 순위 리스트 (WPM 내림차순)
  const finalList = useMemo(() => {
    const others: (RankingItem & { isMe?: boolean })[] = [];

    // 실제 유저들 (나 제외)
    realItems.filter((r) => r.userId !== userId).forEach((r) => others.push(r));

    // 더미 유저 보충 (최소 6명)
    const needed = Math.max(0, 6 - others.length);
    const offsets = [18, 12, 8, 4, -5, -10, -15, -20, -25, -30];
    for (let i = 0; i < needed; i++) {
      const dWpm = makeDummyWpm(myWpm, offsets[i] ?? -i * 5);
      others.push({
        rank: 0,
        userId: -(i + 1),
        username: DUMMY_NAMES[i % DUMMY_NAMES.length],
        core: 0,
        wpm: dWpm,
        accuracy: 90 + Math.random() * 8,
        createdAt: '',
      });
    }

    // 나 포함 WPM 내림차순 정렬
    const all: (RankingItem & { isMe?: boolean })[] = [
      ...others,
      { rank: 0, userId, username: myUsername, core: 0, wpm: myWpm, accuracy: 95, createdAt: '', isMe: true },
    ].sort((a, b) => b.wpm - a.wpm).map((r, i) => ({ ...r, rank: i + 1 }));

    return all;
  }, [realItems, userId, myWpm, myUsername]);

  const myFinalIdx = finalList.findIndex((r) => r.isMe);

  // 애니메이션: initial → rising → done
  useEffect(() => {
    if (finalList.length === 0) return;
    const t1 = setTimeout(() => setPhase('rising'), 400);
    const t2 = setTimeout(() => setPhase('done'),   1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [finalList.length]);

  // 보여줄 슬라이스: 내 순위 위아래 2개씩
  const visStart = Math.max(0, myFinalIdx - 2);
  const visEnd   = Math.min(finalList.length - 1, myFinalIdx + 2);
  const visible  = finalList.slice(visStart, visEnd + 1);
  const myVisIdx = visible.findIndex((r) => r.isMe); // 보이는 리스트 내 내 위치

  // initial 단계에서 내 카드는 맨 아래에 있는 것처럼 translateY 설정
  const myInitialOffset = (visible.length - 1 - myVisIdx) * ROW_H;

  return (
    <div>
      {/* 순위 + 상승 표시 */}
      <div className="flex items-center gap-3.5 mb-4">
        <span
          className="dt-mono text-[44px] font-bold leading-none text-dt-primary transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] inline-block"
          style={{
            transform: phase !== 'initial' ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(12px)',
            opacity: phase !== 'initial' ? 1 : 0,
          }}
        >
          #{myFinalIdx + 1}
        </span>
        <div className="transition-opacity duration-500 ease delay-[0.4s]" style={{ opacity: phase !== 'initial' ? 1 : 0 }}>
          <div className="text-[11px] text-dt-text-3 mb-0.5">이 스니펫 순위</div>
          <div className="flex items-center gap-1.5">
            <span className="text-dt-success text-base font-bold">↑</span>
            <span className="dt-mono text-[13px] text-dt-text-2">{myWpm} wpm</span>
          </div>
        </div>
      </div>

      {/* 랭킹 카드 슬라이드 */}
      <div className="relative overflow-hidden" style={{ height: visible.length * ROW_H + 8 }}>
        {visible.map((item, i) => {
          const isMe = !!item.isMe;

          // 내 카드: initial → 맨 아래, rising/done → 제자리
          const yOffset = isMe && phase === 'initial' ? myInitialOffset : 0;
          const topPos  = i * ROW_H;

          return (
            <div
              key={item.userId}
              className="absolute left-0 right-0 h-10 flex items-center gap-2.5 px-3 rounded-lg"
              style={{
                top: topPos,
                background: isMe
                  ? 'color-mix(in oklab, var(--dt-primary) 14%, transparent)'
                  : 'var(--dt-hover)',
                boxShadow: isMe
                  ? 'inset 0 0 0 1.5px color-mix(in oklab, var(--dt-primary) 40%, transparent)'
                  : 'none',
                transition: isMe
                  ? 'transform 0.75s cubic-bezier(0.34, 1.15, 0.64, 1) 0.1s, opacity 0.4s ease'
                  : `opacity 0.4s ease ${i * 0.05}s`,
                transform: `translateY(${yOffset}px)`,
                opacity: phase === 'initial' && !isMe ? 0 : 1,
              }}
            >
              {/* 순위 */}
              <span
                className="dt-mono w-7 text-xs text-right shrink-0"
                style={{
                  color: item.rank === 1 ? 'var(--dt-warning)'
                       : item.rank === 2 ? '#c0c0c0'
                       : item.rank === 3 ? '#cd7f32'
                       : 'var(--dt-text-3)',
                  fontWeight: item.rank <= 3 ? 700 : 400,
                }}
              >
                #{item.rank}
              </span>

              {/* 유저명 */}
              <span
                className="dt-mono flex-1 text-[13px] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-2)',
                  fontWeight: isMe ? 700 : 400,
                }}
              >
                {isMe ? `▶ ${myUsername}` : item.username}
              </span>

              {/* WPM */}
              <span
                className="dt-mono text-[13px] shrink-0"
                style={{
                  color: isMe ? 'var(--dt-primary)' : 'var(--dt-text-3)',
                  fontWeight: isMe ? 600 : 400,
                }}
              >
                {item.wpm}
              </span>
            </div>
          );
        })}
      </div>

      {/* 상단/하단 생략 표시 */}
      <div className="flex justify-between mt-1.5 transition-opacity duration-300 ease delay-[0.6s]" style={{ opacity: phase !== 'initial' ? 1 : 0 }}>
        <span className="text-[11px] text-dt-text-3">
          {visStart > 0 ? `▲ 위 ${visStart}명` : ''}
        </span>
        <span className="text-[11px] text-dt-text-3">
          {visEnd < finalList.length - 1 ? `▼ 아래 ${finalList.length - 1 - visEnd}명` : ''}
        </span>
      </div>
    </div>
  );
};

export default RankSlideWidget;
