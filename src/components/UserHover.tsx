import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { formatCore } from '@/utils/formatCore';
import { useUserStore } from '@/stores/userStore';
import { getUserHoverCard, type UserHoverResponse } from '@/apis/userApi';

interface Props {
  handle: string;
  profileUrl?: string | null;
  bannerUrl?: string | null;
  children: React.ReactNode;
  stats?: {
    totalCore?: number;
    avgWpm?: number;
    currentStreak?: number;
    rank?: number;
  };
}

function userHue(h: string) { return (h.charCodeAt(0) * 7) % 360; }

const CARD_W  = 240;
const CARD_H  = 160; // 배너56 + body padding + avatar행 + stats행
const OFFSET  = 14;  // 커서와 카드 사이 여백

const UserHover = ({ handle, profileUrl: profileUrlProp, bannerUrl: bannerUrlProp, children, stats: statsProp }: Props) => {
  const [pos,       setPos]       = useState<{ x: number; y: number } | null>(null);
  const [onCard,    setOnCard]    = useState(false);
  const [hoverData, setHoverData] = useState<UserHoverResponse | null>(null);
  const fetchedRef                = useRef<string | null>(null);
  const navigate                  = useNavigate();
  const myUsername                = useUserStore((s) => s.username);
  const isSelf                    = !!myUsername && myUsername === handle;
  const hue                       = userHue(handle);

  const profileUrl = hoverData?.profileUrl ?? profileUrlProp;
  const bannerUrl  = hoverData?.bannerUrl  ?? bannerUrlProp;
  const stats = hoverData
    ? { totalCore: hoverData.totalCore, currentStreak: hoverData.currentStreak, rank: hoverData.globalRank }
    : statsProp;
  const hasStats = stats && (stats.totalCore !== undefined || stats.currentStreak !== undefined);

  const fetchHover = useCallback(() => {
    if (fetchedRef.current === handle) return;
    fetchedRef.current = handle;
    getUserHoverCard(handle)
      .then(setHoverData)
      .catch(() => { fetchedRef.current = null; });
  }, [handle]);

  // 커서 위치 → 카드 fixed 좌표 계산
  const calcCardPos = (x: number, y: number): React.CSSProperties => {
    let top  = y - CARD_H - OFFSET;
    let left = x + OFFSET;

    if (top < 8) top = y + OFFSET + 16; // 커서 아래 여백 포함
    if (left + CARD_W > window.innerWidth - 8) left = x - CARD_W - OFFSET;
    if (left < 8) left = 8;

    return { position: 'fixed', top, left, zIndex: 99999 };
  };

  // 트리거 이벤트
  const onTriggerEnter = (e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    fetchHover();
  };
  const onTriggerMove  = (e: React.MouseEvent) => {
    if (!onCard) setPos({ x: e.clientX, y: e.clientY });
  };
  const onTriggerLeave = (e: React.MouseEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest('[data-userhover]')) setPos(null);
  };

  // 카드 이벤트
  const onCardEnter = () => setOnCard(true);
  const onCardLeave = () => { setOnCard(false); setPos(null); };

  const portalRoot = typeof document !== 'undefined'
    ? (document.getElementById('dt-portal-root') ?? document.body)
    : null;

  const card = pos && portalRoot && (
    <div
      data-userhover
      onClick={() => navigate(isSelf ? '/profile' : `/profile/${handle}`)}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
      style={{
        ...calcCardPos(pos.x, pos.y),
        width: CARD_W,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--dt-card)',
        border: '1px solid var(--dt-border)',
        cursor: 'pointer',
        boxShadow: '0 24px 56px -12px rgba(0,0,0,0.75)',
        fontFamily: 'var(--dt-font-sans)',
        textAlign: 'left',
        animation: 'dt-rise 120ms ease-out',
      }}>

      {/* Banner */}
      <div style={{ height: 56, position: 'relative', overflow: 'hidden' }}>
        {bannerUrl
          ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, oklch(52% 0.19 ${hue}) 0%, oklch(40% 0.16 ${(hue + 50) % 360}) 100%)` }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.3) 100%)' }} />
      </div>

      {/* Body */}
      <div style={{ padding: '10px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar handle={handle} hue={hue} size={36} src={profileUrl ?? undefined} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
            <span className="dt-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--dt-text)', whiteSpace: 'nowrap' }}>{handle}</span>
            {isSelf && <span style={{ fontSize: 10, color: 'var(--dt-primary)', fontWeight: 700 }}>나</span>}
            {stats?.rank != null && <span className="dt-mono" style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>#{stats.rank}</span>}
          </div>
        </div>

        {hasStats && (
          <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--dt-border)' }}>
            {stats?.totalCore !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>CORE</span>
                <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-primary)', fontWeight: 700 }}>{formatCore(stats.totalCore)}</span>
              </div>
            )}
            {stats?.currentStreak !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dt-text-3)' }}>STREAK</span>
                <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-warning)', fontWeight: 600 }}>🔥{stats.currentStreak}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <span
      style={{ display: 'inline-flex', cursor: 'pointer' }}
      onClick={() => navigate(isSelf ? '/profile' : `/profile/${handle}`)}
      onMouseEnter={onTriggerEnter}
      onMouseMove={onTriggerMove}
      onMouseLeave={onTriggerLeave}
    >
      {children}
      {card && createPortal(card, portalRoot)}
    </span>
  );
};

export default UserHover;
