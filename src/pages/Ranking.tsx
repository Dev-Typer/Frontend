import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { LANG_ICON } from '@/data';
import { useUserStore } from '@/stores/userStore';
import { formatCore } from '@/utils/formatCore';
import Segmented from '@/components/Segmented';
import Avatar from '@/components/Avatar';
import UserHover from '@/components/UserHover';
import { IconChevronDown } from '@/components/icons/Icons';
import { getSoloLeaderboard, getStreakLeaderboard } from '@/apis/leaderboardApi';
import type { SoloLeaderboardEntry, StreakLeaderboardEntry } from '@/apis/leaderboardApi';
import { getDailyLeaderboard } from '@/apis/dailyChallengeApi';
import type { LeaderboardItem, ChallengeLeaderboardDto } from '@/apis/dailyChallengeApi';

const LANG_OPTS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'C', 'Rust', 'Kotlin'];

// ─── Shared table primitives ──────────────────────────────────────────────────
interface ColDef { template: string; labels: string[]; aligns: string[] }

const TableHeader = ({ cols }: { cols: ColDef }) => (
  <div className="grid gap-4 px-6 py-[14px] border-b border-dt-border/50"
    style={{ gridTemplateColumns: cols.template }}>
    {cols.labels.map((l, i) => (
      <span key={i} className="dt-label" style={{ textAlign: cols.aligns[i] as 'left' | 'right' }}>{l}</span>
    ))}
  </div>
);

const TableRow = ({ children, me }: { children: React.ReactNode; me?: boolean }) => (
  <div className="border-b border-dt-border/50"
    style={{ background: me ? 'color-mix(in oklab, var(--dt-primary) 8%, transparent)' : 'transparent' }}>
    {children}
  </div>
);

const RankBadge = ({ rank }: { rank: number }) => (
  <span className="dt-mono tabular-nums text-[15px]"
    style={{ fontWeight: rank <= 3 ? 700 : 500, color: rank === 1 ? 'var(--dt-primary)' : rank <= 3 ? 'var(--dt-text)' : 'var(--dt-text-2)' }}>
    {rank}
  </span>
);

interface PlayerCellProps {
  username: string;
  profileUrl: string | null;
  me?: boolean;
  stats?: { totalCore?: number; avgWpm?: number; currentStreak?: number; rank?: number };
}

const PlayerCell = ({ username, profileUrl, me, stats }: PlayerCellProps) => (
  <UserHover handle={username} stats={stats}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar handle={username} hue={(username.charCodeAt(0) * 7) % 360} size={28} src={profileUrl ?? undefined} />
      <span className="dt-mono" style={{ fontSize: 14, color: me ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
        {username}{me && <span style={{ marginLeft: 6, fontSize: 12 }}>(you)</span>}
      </span>
    </div>
  </UserHover>
);

const EmptyRow = ({ cols }: { cols: number }) => (
  <div className="px-6 py-10 text-center dt-caption" style={{ gridColumn: `1 / ${cols + 1}` }}>
    아직 기록이 없습니다.
  </div>
);

// ─── CoreTable ────────────────────────────────────────────────────────────────
function CoreTable({ rows, loading }: { rows: SoloLeaderboardEntry[]; loading: boolean }) {
  const t = useT();
  const tpl = '64px 1fr 92px 84px 90px 80px 110px';
  return (
    <div className="dt-card p-0">
      <TableHeader cols={{
        template: tpl,
        labels: [t('Rank'), t('Player'), 'avgWPM', t('Plays'), t('Snippets'), 'Acc%', 'CORE'],
        aligns: ['left', 'left', 'right', 'right', 'right', 'right', 'right'],
      }} />
      {loading ? (
        <div className="px-6 py-10 text-center dt-caption">loading...</div>
      ) : rows.length === 0 ? (
        <EmptyRow cols={7} />
      ) : rows.map(r => (
        <TableRow key={r.userId} me={r.isMe}>
          <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
            <RankBadge rank={r.rank} />
            <PlayerCell username={r.username} profileUrl={r.profileUrl} me={r.isMe}
              stats={{ rank: r.rank, totalCore: r.totalCore, avgWpm: r.avgWpm }} />
            <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.avgWpm}</span>
            <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.playCount}</span>
            <span className="dt-mono tabular-nums text-right text-[14px] text-dt-primary font-semibold">{r.snippetCount}</span>
            <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.avgAccuracy}%</span>
            <span className="dt-mono tabular-nums text-right text-[17px] font-bold"
              style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
              {formatCore(r.totalCore)}
            </span>
          </div>
        </TableRow>
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function OverallTable() {
  const [rows, setRows] = useState<SoloLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSoloLeaderboard(1, 50)
      .then(res => setRows(res.entries))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return <CoreTable rows={rows} loading={loading} />;
}

function LanguageTable({ lang }: { lang: string }) {
  const [rows, setRows] = useState<SoloLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSoloLeaderboard(1, 50, lang)
      .then(res => setRows(res.entries))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [lang]);

  return <CoreTable rows={rows} loading={loading} />;
}

function StreakTable() {
  const t = useT();
  const [rows, setRows] = useState<StreakLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreakLeaderboard(1, 50)
      .then(res => setRows(res.entries))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const tpl = '64px 1fr 150px';
  return (
    <div className="dt-card p-0">
      <TableHeader cols={{
        template: tpl,
        labels: [t('Rank'), t('Player'), t('Current streak')],
        aligns: ['left', 'left', 'right'],
      }} />
      {loading ? (
        <div className="px-6 py-10 text-center dt-caption">loading...</div>
      ) : rows.length === 0 ? (
        <EmptyRow cols={3} />
      ) : rows.map(r => (
        <TableRow key={r.userId} me={r.isMe}>
          <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
            <RankBadge rank={r.rank} />
            <PlayerCell username={r.username} profileUrl={r.profileUrl} me={r.isMe}
              stats={{ rank: r.rank, currentStreak: r.currentStreak }} />
            <span className="flex items-center justify-end gap-[6px] text-right">
              <span className="text-[15px]">🔥</span>
              <span className="dt-mono tabular-nums text-[17px] font-bold"
                style={{ color: r.rank <= 3 ? '#FF7A3C' : 'var(--dt-text)' }}>
                {r.currentStreak}
              </span>
              <span className="dt-caption">{t('days')}</span>
            </span>
          </div>
        </TableRow>
      ))}
    </div>
  );
}

// ─── Daily challenge table ───────────────────────────────────────────────────
function DailyChallengeTable() {
  const t = useT();
  const myUserId = useUserStore((s) => s.userId);
  const [data, setData] = useState<ChallengeLeaderboardDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyLeaderboard()
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const tpl = '64px 1fr 110px 90px 90px 90px';
  const rows: LeaderboardItem[] = data?.items ?? [];

  return (
    <div className="dt-card p-0">
      {data && (
        <div className="flex items-center gap-[10px] px-6 py-4 border-b border-dt-border/50">
          <span className="dt-h3 m-0">Today · {new Date(data.date).toLocaleDateString('ko-KR')}</span>
          {data.total > 0 && <span className="dt-caption">· {data.total.toLocaleString()} submissions</span>}
        </div>
      )}
      <TableHeader cols={{
        template: tpl,
        labels: [t('Rank'), t('Player'), 'CORE', 'WPM', 'nWPM', 'Acc%'],
        aligns: ['left', 'left', 'right', 'right', 'right', 'right'],
      }} />
      {loading ? (
        <div className="px-6 py-10 text-center dt-caption">loading...</div>
      ) : rows.length === 0 ? (
        <EmptyRow cols={6} />
      ) : rows.map(r => {
        const isMe = myUserId !== null && r.userId === myUserId;
        return (
          <TableRow key={r.userId} me={isMe}>
            <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
              <RankBadge rank={r.rank} />
              <PlayerCell username={r.username} profileUrl={r.profileUrl} me={isMe} />
              <span className="dt-mono tabular-nums text-right text-[17px] font-bold"
                style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
                {Math.round(r.core)}
              </span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.wpm.toFixed(1)}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.nWpm.toFixed(1)}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.accuracy.toFixed(1)}%</span>
            </div>
          </TableRow>
        );
      })}
    </div>
  );
}

// ─── Language dropdown ────────────────────────────────────────────────────────
function LangSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const icon = LANG_ICON[value.toLowerCase()];
  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 180 }}>
      <button
        onClick={() => setOpen(p => !p)}
        className="dt-input dt-mono cursor-default w-full"
        style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 32, textAlign: 'left' }}
      >
        {icon && <img src={icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{value}</span>
        <IconChevronDown size={16} style={{ position: 'absolute', right: 12, color: 'var(--dt-text-3)' }} />
      </button>
      {open && (
        <div className="dt-card p-1" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200, maxHeight: 320, overflowY: 'auto' }}>
          {LANG_OPTS.map(l => {
            const ico = LANG_ICON[l.toLowerCase()];
            return (
              <button key={l} onClick={() => { onChange(l); setOpen(false); }}
                className="dt-mono w-full"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, border: 0, cursor: 'default',
                  background: l === value ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)' : 'transparent',
                  color: 'var(--dt-text)', textAlign: 'left',
                }}
              >
                {ico && <img src={ico} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />}
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const VALID_TABS = ['overall', 'language', 'daily', 'streak'];

const Ranking = () => {
  const t = useT();
  const [searchParams] = useSearchParams();
  const initialTab = VALID_TABS.includes(searchParams.get('tab') ?? '') ? (searchParams.get('tab') as string) : 'overall';
  const [tab, setTab] = useState(initialTab);
  const [lang, setLang] = useState('JavaScript');

  return (
    <div className="dt-page">
      <div className="flex justify-between items-center mt-1 mb-6 flex-wrap gap-3">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'overall',  label: t('Overall') },
            { value: 'language', label: t('By language') },
            { value: 'daily',    label: t("Today's challenge") },
            { value: 'streak',   label: t('Streak') },
          ]}
        />
        {tab === 'language' && <LangSelect value={lang} onChange={setLang} />}
      </div>

      {tab === 'overall'  && <OverallTable />}
      {tab === 'language' && <LanguageTable lang={lang} />}
      {tab === 'daily'    && <DailyChallengeTable />}
      {tab === 'streak'   && <StreakTable />}
    </div>
  );
};

export default Ranking;
