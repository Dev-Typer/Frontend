import { useState } from 'react';
import { useT } from '@/i18n';
import { GLOBAL_RANKING, CHALLENGE_BOARD } from '@/data';
import SectionHead from '@/components/SectionHead';
import Segmented from '@/components/Segmented';
import Pill from '@/components/Pill';
import Avatar from '@/components/Avatar';
import TierBadge from '@/components/TierBadge';
import Sparkline from '@/components/Sparkline';
import { IconCrown, IconCalendar, IconLanguage } from '@/components/icons/Icons';

function genSpark(seed: number): number[] {
  const out: number[] = [];
  let v = 50 + (seed * 13) % 30;
  for (let i = 0; i < 14; i++) {
    v += Math.sin(seed + i * 0.6) * 12 + (i * 1.2);
    out.push(v);
  }
  return out;
}

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <span className="dt-mono" style={{ fontSize: 16, color: 'var(--dt-warning)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCrown size={16} /> #1</span>;
  if (rank === 2) return <span className="dt-mono" style={{ fontSize: 15, color: 'var(--dt-silver-fg)' }}>#2</span>;
  if (rank === 3) return <span className="dt-mono" style={{ fontSize: 15, color: 'var(--dt-bronze-fg)' }}>#3</span>;
  return <span className="dt-mono" style={{ fontSize: 14, color: 'var(--dt-text-2)' }}>#{rank}</span>;
};

interface ColDef {
  template: string;
  labels: string[];
  aligns: string[];
}

const TableHeader = ({ cols }: { cols: ColDef }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols.template, gap: 16, padding: '14px 24px', borderBottom: '0.5px solid var(--dt-border)' }}>
    {cols.labels.map((l, i) => (
      <span key={i} className="dt-label" style={{ textAlign: cols.aligns[i] as 'left' | 'right' | 'center' ?? 'left' }}>{l}</span>
    ))}
  </div>
);

const TableRow = ({ children, me }: { children: React.ReactNode; me?: boolean }) => (
  <div style={{ background: me ? 'color-mix(in oklab, var(--dt-primary) 8%, transparent)' : 'transparent', borderBottom: '0.5px solid var(--dt-border)' }}>
    {children}
  </div>
);

const OverallTable = () => {
  const t = useT();
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <TableHeader cols={{ template: '70px 1fr 130px 100px 100px 90px', labels: [t('Rank'), t('Developer'), t('Tier'), t('Rating'), t('Avg WPM'), t('Trend')], aligns: ['left','left','left','right','right','right'] }} />
      {GLOBAL_RANKING.map((r) => (
        <TableRow key={r.handle} me={r.me}>
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 130px 100px 100px 90px', gap: 16, padding: '14px 24px', alignItems: 'center' }}>
            <RankBadge rank={r.rank} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar handle={r.handle} hue={(r.handle.charCodeAt(0) * 7) % 360} size={28} />
              <span className="dt-mono" style={{ fontSize: 14, color: r.me ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
                {r.handle}{r.me && <span style={{ marginLeft: 6, fontSize: 12 }}>(you)</span>}
              </span>
            </div>
            <TierBadge tier={r.tier} />
            <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 15 }}>{r.rating}</span>
            <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 15, color: 'var(--dt-text-2)' }}>{r.wpm}</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Sparkline data={genSpark(r.rank)} width={70} height={20} color={r.me ? 'var(--dt-primary)' : 'var(--dt-text-3)'} />
            </div>
          </div>
        </TableRow>
      ))}
    </div>
  );
};

const LanguageTable = ({ lang }: { lang: string }) => {
  const offset = ({ JavaScript: 0, TypeScript: 5, Python: 3, Go: 6, Java: 8, SQL: 12 } as Record<string, number>)[lang] ?? 0;
  const rows = GLOBAL_RANKING.map((r, i) => {
    const adjustedRank = ((i + offset) % GLOBAL_RANKING.length) + 1;
    return { ...r, rank: adjustedRank };
  }).sort((a, b) => a.rank - b.rank);
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconLanguage size={16} style={{ color: 'var(--dt-primary)' }} />
        <span className="dt-h3" style={{ margin: 0 }}>{lang} masters</span>
        <span className="dt-caption">· average WPM on {lang} snippets</span>
      </div>
      <TableHeader cols={{ template: '70px 1fr 130px 120px 120px', labels: ['Rank', 'Developer', 'Tier', 'Avg WPM', 'Snippets'], aligns: ['left','left','left','right','right'] }} />
      {rows.slice(0, 12).map((r) => (
        <TableRow key={r.handle} me={r.me}>
          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 130px 120px 120px', gap: 16, padding: '14px 24px', alignItems: 'center' }}>
            <RankBadge rank={r.rank} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar handle={r.handle} hue={(r.handle.charCodeAt(0) * 7) % 360} size={28} />
              <span className="dt-mono" style={{ fontSize: 14, color: r.me ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
                {r.handle}{r.me && <span style={{ marginLeft: 6, fontSize: 12 }}>(you)</span>}
              </span>
            </div>
            <TierBadge tier={r.tier} />
            <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 18, fontWeight: 500, color: 'var(--dt-primary)' }}>{r.wpm + (offset * 2 - 6)}</span>
            <span className="dt-mono dt-tabular dt-caption" style={{ textAlign: 'right' }}>{Math.round(40 + Math.random() * 100)}</span>
          </div>
        </TableRow>
      ))}
    </div>
  );
};

const ChallengeTable = () => (
  <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconCalendar size={16} style={{ color: 'var(--dt-primary)' }} />
      <span className="dt-h3" style={{ margin: 0 }}>Today · TypeScript medium</span>
      <span className="dt-caption">· 4,218 submissions so far</span>
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="dt-live-dot" />
        <span className="dt-caption">live</span>
      </span>
    </div>
    <TableHeader cols={{ template: '70px 1fr 130px 100px 100px', labels: ['Rank', 'Developer', 'Tier', 'WPM', 'Accuracy'], aligns: ['left','left','left','right','right'] }} />
    {CHALLENGE_BOARD.map((r) => (
      <TableRow key={r.handle} me={r.me}>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 130px 100px 100px', gap: 16, padding: '14px 24px', alignItems: 'center' }}>
          <RankBadge rank={r.rank} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar handle={r.handle} hue={(r.handle.charCodeAt(0) * 7) % 360} size={28} />
            <span className="dt-mono" style={{ fontSize: 14, color: r.me ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
              {r.handle}{r.me && <span style={{ marginLeft: 6, fontSize: 12 }}>(you)</span>}
            </span>
          </div>
          <TierBadge tier={r.tier} />
          <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 18, fontWeight: 500, color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{r.wpm}</span>
          <span className="dt-mono dt-tabular" style={{ textAlign: 'right', color: 'var(--dt-text-2)' }}>{r.acc}%</span>
        </div>
      </TableRow>
    ))}
  </div>
);

const Ranking = () => {
  const t = useT();
  const [tab, setTab] = useState('overall');
  const [lang, setLang] = useState('JavaScript');

  return (
    <div className="dt-page">
      <SectionHead kicker="Ranking" title="Top developers right now." />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Segmented value={tab} onChange={setTab} options={[
          { value: 'overall',  label: t('Overall') },
          { value: 'language', label: t('By language') },
          { value: 'daily',    label: t("Today's challenge") },
        ]} />
        {tab === 'language' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dt-caption">Language:</span>
            {['JavaScript', 'TypeScript', 'Python', 'Go', 'Java', 'SQL'].map((l) => (
              <Pill key={l} active={lang === l} onClick={() => setLang(l)}>{l}</Pill>
            ))}
          </div>
        )}
      </div>
      {tab === 'overall'  && <OverallTable />}
      {tab === 'language' && <LanguageTable lang={lang} />}
      {tab === 'daily'    && <ChallengeTable />}
    </div>
  );
};

export default Ranking;
