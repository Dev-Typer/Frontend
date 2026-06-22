import { useState } from 'react';
import { useT } from '@/i18n';
import { GLOBAL_RANKING, CHALLENGE_BOARD, LANG_ICON } from '@/data';
import Segmented from '@/components/Segmented';
import Avatar from '@/components/Avatar';
import UserHover from '@/components/UserHover';
import { IconCalendar, IconChevronDown } from '@/components/icons/Icons';

const LANG_OPTS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'C#', 'C', 'Rust', 'SQL'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function coreFields(r: { handle: string; rating?: number; rank: number; wpm?: number }, langBoost = 0) {
  const seed = r.handle.charCodeAt(0) + r.handle.length * 7;
  const nWpm = Math.round(((r.wpm ?? 80) * 0.92 + (seed % 7)) * 10) / 10;
  const plays = 60 + (seed * 13) % 200;
  const snippets = 12 + (seed * 5) % 44;
  const acc = Math.round((88 + (seed % 11)) * 10) / 10;
  const totalCore = Math.round(((r.rating ?? 1500) * 2.6 + langBoost - r.rank * 60));
  return { nWpm, plays, snippets, acc, totalCore };
}

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

const PlayerCell = ({ handle, me, tier }: { handle: string; me?: boolean; tier?: string }) => (
  <UserHover handle={handle} tier={tier}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar handle={handle} hue={(handle.charCodeAt(0) * 7) % 360} size={28} />
      <span className="dt-mono" style={{ fontSize: 14, color: me ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
        {handle}{me && <span style={{ marginLeft: 6, fontSize: 12 }}>(you)</span>}
      </span>
    </div>
  </UserHover>
);

// ─── CoreTable (Overall / Language) ──────────────────────────────────────────
function CoreTable({ rows, langBoost = 0 }: { rows: typeof GLOBAL_RANKING; langBoost?: number }) {
  const t = useT();
  const tpl = '64px 1fr 92px 84px 90px 80px 110px';
  return (
    <div className="dt-card p-0">
      <TableHeader cols={{
        template: tpl,
        labels: [t('Rank'), t('Player'), 'nWPM', t('Plays'), t('Snippets'), 'Acc%', 'CORE'],
        aligns: ['left','left','right','right','right','right','right'],
      }} />
      {rows.map(r => {
        const c = coreFields(r, langBoost);
        return (
          <TableRow key={r.handle} me={r.me}>
            <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
              <RankBadge rank={r.rank} />
              <PlayerCell handle={r.handle} me={r.me} tier={r.tier} />
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{c.nWpm}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{c.plays}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-primary font-semibold">{c.snippets}</span>
              <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{c.acc}%</span>
              <span className="dt-mono tabular-nums text-right text-[17px] font-bold"
                style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
                {c.totalCore}
              </span>
            </div>
          </TableRow>
        );
      })}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function OverallTable() {
  return <CoreTable rows={GLOBAL_RANKING} />;
}

function LanguageTable({ lang }: { lang: string }) {
  const OFFSET: Record<string, number> = { JavaScript: 0, TypeScript: 5, Python: 3, Java: 8, Go: 6, 'C++': 9, 'C#': 11, C: 13, Rust: 15, SQL: 12 };
  const offset = OFFSET[lang] ?? 0;
  const len = GLOBAL_RANKING.length;
  const rows = GLOBAL_RANKING
    .map((r, i) => ({ ...r, rank: ((i + offset) % len) + 1 }))
    .sort((a, b) => a.rank - b.rank);
  return <CoreTable rows={rows} langBoost={offset * 40} />;
}

function ChallengeTable() {
  const tpl = '70px 1fr 1fr 100px 100px';
  return (
    <div className="dt-card p-0">
      <div className="flex items-center gap-[10px] px-6 py-4 border-b border-dt-border/50">
        <IconCalendar size={16} style={{ color: 'var(--dt-primary)' }} />
        <span className="dt-h3 m-0">Today · TypeScript medium</span>
        <span className="dt-caption">· 4,218 submissions so far</span>
        <span className="ml-auto flex items-center gap-[6px]">
          <span className="dt-live-dot" />
          <span className="dt-caption">live</span>
        </span>
      </div>
      <TableHeader cols={{
        template: tpl,
        labels: ['Rank', 'Developer', '', 'WPM', 'Accuracy'],
        aligns: ['left','left','left','right','right'],
      }} />
      {CHALLENGE_BOARD.map(r => (
        <TableRow key={r.handle} me={r.me}>
          <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
            <RankBadge rank={r.rank} />
            <PlayerCell handle={r.handle} me={r.me} tier={r.tier} />
            <span />
            <span className="dt-mono tabular-nums text-right text-[18px] font-medium"
              style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
              {r.wpm}
            </span>
            <span className="dt-mono tabular-nums text-right text-dt-text-2">{r.acc}%</span>
          </div>
        </TableRow>
      ))}
    </div>
  );
}

function StreakTable() {
  const t = useT();
  const tpl = '64px 1fr 150px 130px';
  const rows = GLOBAL_RANKING.map(r => {
    const seed = r.handle.charCodeAt(0) + r.handle.length * 11;
    return { ...r, streak: Math.max(1, 80 - r.rank * 3 + (seed % 9)), best: Math.max(1, 90 - r.rank * 2 + (seed % 14)) };
  }).sort((a, b) => b.streak - a.streak).map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="dt-card p-0">
      <TableHeader cols={{
        template: tpl,
        labels: [t('Rank'), t('Player'), t('Current streak'), t('Best')],
        aligns: ['left','left','right','right'],
      }} />
      {rows.map(r => (
        <TableRow key={r.handle} me={r.me}>
          <div className="grid gap-4 px-6 py-[14px] items-center" style={{ gridTemplateColumns: tpl }}>
            <RankBadge rank={r.rank} />
            <PlayerCell handle={r.handle} me={r.me} tier={r.tier} />
            <span className="flex items-center justify-end gap-[6px] text-right">
              <span className="text-[15px]">🔥</span>
              <span className="dt-mono tabular-nums text-[17px] font-bold"
                style={{ color: r.rank <= 3 ? '#FF7A3C' : 'var(--dt-text)' }}>
                {r.streak}
              </span>
              <span className="dt-caption">{t('days')}</span>
            </span>
            <span className="dt-mono tabular-nums text-right text-[14px] text-dt-text-2">{r.best} {t('days')}</span>
          </div>
        </TableRow>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const Ranking = () => {
  const t = useT();
  const [tab, setTab] = useState('overall');
  const [lang, setLang] = useState('JavaScript');
  const icon = LANG_ICON[lang.toLowerCase()];

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
        {tab === 'language' && (
          <div className="relative flex items-center gap-2">
            {icon && (
              <img src={icon} alt="" className="absolute left-3 w-[18px] h-[18px] object-contain pointer-events-none" />
            )}
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="dt-input dt-mono cursor-default"
              style={{ paddingLeft: icon ? 38 : 12, paddingRight: 32, minWidth: 180, appearance: 'none', WebkitAppearance: 'none' }}
            >
              {LANG_OPTS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="absolute right-3 pointer-events-none text-dt-text-3">
              <IconChevronDown size={16} />
            </span>
          </div>
        )}
      </div>

      {tab === 'overall'  && <OverallTable />}
      {tab === 'language' && <LanguageTable lang={lang} />}
      {tab === 'daily'    && <ChallengeTable />}
      {tab === 'streak'   && <StreakTable />}
    </div>
  );
};

export default Ranking;
