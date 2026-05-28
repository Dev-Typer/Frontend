import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { ME, RECENT_BATTLES, CHALLENGE_HISTORY, STREAK_HISTORY, STREAK_STATS } from '@/data';
import Avatar from '@/components/Avatar';
import TierBadge from '@/components/TierBadge';
import { IconSettings, IconSwords } from '@/components/icons/Icons';
import type { StreakEntry } from '@/types';

const ProfileHeader = () => {
  const t = useT();
  const navigate = useNavigate();
  const me = ME;
  return (
    <div className="dt-card" style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
      <Avatar handle={me.handle} hue={me.avatarHue} size={88} ring="var(--dt-primary)" />
      <div className="dt-stack" style={{ gap: 6, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="dt-h1" style={{ margin: 0, fontFamily: 'var(--dt-font-mono)', fontWeight: 500 }}>{me.handle}</h1>
          <TierBadge tier={me.tier} size="lg" />
        </div>
        <div style={{ display: 'flex', gap: 18, color: 'var(--dt-text-2)', fontSize: 14, marginTop: 4 }}>
          <span><span className="dt-mono dt-tabular" style={{ color: 'var(--dt-text)' }}>{me.rating}</span> {t('rating')}</span>
          <span>·</span>
          <span>{t('Global rank')} <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>#11</span></span>
          <span>·</span>
          <span>{t('Joined')} {me.joined}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="dt-btn dt-btn-secondary"><IconSettings size={16} /> {t('Settings')}</button>
        <button className="dt-btn dt-btn-primary" onClick={() => navigate('/battle')}><IconSwords size={16} /> {t('Enter battle')}</button>
      </div>
    </div>
  );
};

const SummaryStats = () => {
  const t = useT();
  const me = ME;
  const stats = [
    { label: t('Total plays'), value: me.totalPlays, hint: t('solo + battle') },
    { label: t('Avg WPM'), value: me.avgWpm, accent: true },
    { label: t('Max WPM'), value: me.maxWpm, hint: t('personal best') },
    { label: t('Avg accuracy'), value: me.avgAcc, unit: '%' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {stats.map((s) => (
        <div key={s.label} className="dt-card" style={{ padding: 20 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{s.label}</div>
          <div className="dt-mono" style={{ fontSize: 30, fontWeight: 500, color: s.accent ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
            <span className="dt-tabular">{s.value}</span>
            {s.unit && <span style={{ fontSize: 14, color: 'var(--dt-text-2)', marginLeft: 4 }}>{s.unit}</span>}
          </div>
          {s.hint && <span className="dt-caption">{s.hint}</span>}
        </div>
      ))}
    </div>
  );
};

const RatingHistoryCard = () => {
  const t = useT();
  const points = useMemo(() => {
    const out: number[] = [];
    const start = 1280, end = 1842;
    for (let i = 0; i < 40; i++) {
      const tv = i / 39;
      const base = start + (end - start) * tv;
      const wobble = Math.sin(i * 0.6) * 22 + Math.cos(i * 0.9) * 12;
      out.push(Math.round(base + wobble));
    }
    out[out.length - 1] = end;
    return out;
  }, []);
  const min = Math.min(...points), max = Math.max(...points);
  const w = 720, h = 180, range = max - min || 1, pad = 8;
  const xs = points.map((_, i) => (i / (points.length - 1)) * (w - 2 * pad) + pad);
  const ys = points.map((v) => h - ((v - min) / range) * (h - 2 * pad) - pad);
  const path = points.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1]} ${h} L ${xs[0]} ${h} Z`;
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--dt-border)' }}>
        <div className="dt-stack" style={{ gap: 4 }}>
          <span className="dt-h3" style={{ margin: 0 }}>{t('Rating history')}</span>
          <span className="dt-caption">{t('Last 40 battles')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="dt-mono dt-tabular" style={{ fontSize: 28, color: 'var(--dt-primary)' }}>{points[points.length - 1]}</span>
          <span className="dt-caption">{t('current')}</span>
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="rateFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dt-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--dt-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => <line key={i} x1={0} x2={w} y1={(i + 1) * h / 5} y2={(i + 1) * h / 5} stroke="var(--dt-border)" strokeWidth="0.5" opacity="0.5" />)}
          <path d={area} fill="url(#rateFade)" />
          <path d={path} fill="none" stroke="var(--dt-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="var(--dt-primary)" />
          <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="8" fill="var(--dt-primary)" opacity="0.2" />
        </svg>
      </div>
    </div>
  );
};

const LanguageStatsCard = () => {
  const t = useT();
  const me = ME;
  const maxWpm = Math.max(...me.byLang.map((l) => l.wpm));
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--dt-border)' }}>
        <span className="dt-h3" style={{ margin: 0 }}>{t('By language')}</span>
      </div>
      <div style={{ padding: '12px 0' }}>
        {me.byLang.map((l) => (
          <div key={l.lang} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 60px 50px', gap: 16, padding: '10px 24px', alignItems: 'center' }}>
            <span className="dt-body-sm">{l.lang}</span>
            <div style={{ height: 6, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(l.wpm / maxWpm) * 100}%`, height: '100%', background: 'var(--dt-primary)', borderRadius: 999 }} />
            </div>
            <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 14 }}>{l.wpm}</span>
            <span className="dt-mono dt-tabular dt-caption" style={{ textAlign: 'right' }}>{l.plays}p</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentBattlesCard = () => {
  const t = useT();
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="dt-h3" style={{ margin: 0 }}>{t('Recent battles')}</span>
        <span className="dt-caption">{t('Last 10')}</span>
      </div>
      {RECENT_BATTLES.map((b, i, arr) => (
        <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '70px 2.2fr 90px 70px 80px 60px', gap: 12, padding: '14px 24px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '0.5px solid var(--dt-border)' : '0' }}>
          <span className="dt-caption">{b.when}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            {b.opponents.map((o, j) => (
              <span key={j} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Avatar handle={o} hue={(o.charCodeAt(0) * 7) % 360} size={20} />
                <span className="dt-mono" style={{ fontSize: 12 }}>{o}</span>
              </span>
            ))}
          </div>
          <span className="dt-chip" style={{ fontSize: 11 }}>{b.lang}</span>
          <span className="dt-mono dt-tabular" style={{ fontSize: 13, color: 'var(--dt-text-2)' }}>{b.myWpm}w</span>
          <span className="dt-mono" style={{ fontSize: 14, fontWeight: 500, color: b.myRank === 1 ? 'var(--dt-warning)' : 'var(--dt-text)' }}>#{b.myRank}</span>
          <span className="dt-mono dt-tabular" style={{ fontSize: 14, textAlign: 'right', color: b.delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>
            {b.delta >= 0 ? '+' : ''}{b.delta}
          </span>
        </div>
      ))}
    </div>
  );
};

const ChallengeHistoryCard = () => {
  const t = useT();
  return (
    <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--dt-border)' }}>
        <span className="dt-h3" style={{ margin: 0 }}>{t('Daily challenge history')}</span>
      </div>
      {CHALLENGE_HISTORY.map((h, i, arr) => (
        <div key={h.date} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px', gap: 12, padding: '14px 24px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '0.5px solid var(--dt-border)' : '0' }}>
          <span className="dt-mono dt-body-sm" style={{ color: 'var(--dt-text-2)' }}>{h.date}</span>
          <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 14, color: 'var(--dt-primary)' }}>{h.wpm}</span>
          <span className="dt-mono dt-tabular" style={{ textAlign: 'right', fontSize: 13, color: 'var(--dt-text-2)' }}>#{h.rank} <span className="dt-caption">/ {h.total.toLocaleString()}</span></span>
        </div>
      ))}
    </div>
  );
};

const TierProgressCard = () => {
  const t = useT();
  const me = ME;
  const progress = 0.62;
  return (
    <div className="dt-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="dt-h3" style={{ margin: 0 }}>{t('Tier progress')}</span>
        <TierBadge tier={me.tier} />
      </div>
      <div style={{ height: 8, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--dt-diamond-fg)', borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="dt-caption">81 WPM avg</span>
        <span className="dt-caption">Need <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>~9</span> more WPM avg for{' '}<span className="dt-mono" style={{ color: 'var(--dt-diamond-fg)' }}>Diamond</span></span>
      </div>
    </div>
  );
};

function levelBg(lv: number): string {
  return ['rgba(255,255,255,0.04)', 'rgba(80,250,123,0.22)', 'rgba(80,250,123,0.40)', 'rgba(80,250,123,0.62)', 'rgba(80,250,123,0.85)'][lv];
}

const ContributionCell = ({ cell, size }: { cell: StreakEntry | null; size: number }) => {
  if (!cell) return <div style={{ width: size, height: size }} />;
  const lv = !cell.submitted ? 0 : cell.wpm == null ? 1 : cell.wpm < 80 ? 2 : cell.wpm < 100 ? 3 : 4;
  const today = STREAK_HISTORY[STREAK_HISTORY.length - 1].date === cell.date;
  return (
    <div
      title={`${cell.date}${cell.wpm ? ` · ${cell.wpm} wpm` : ' · 미제출'}`}
      style={{ width: size, height: size, background: levelBg(lv), borderRadius: 2, boxShadow: today ? 'inset 0 0 0 1px var(--dt-primary), 0 0 8px rgba(80,250,123,0.5)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.06)', transition: 'transform 100ms', cursor: 'default' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.4)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
    />
  );
};

const StreakCard = () => {
  const t = useT();
  const stats = STREAK_STATS;
  const history = STREAK_HISTORY;
  const cell = 14, gap = 4;
  const DAY_LABELS = [t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat')];

  const firstDay = history[0]?.day ?? 0;
  const weeks: (StreakEntry | null)[][] = [];
  let curWeek: (StreakEntry | null)[] = Array.from({ length: 7 }, () => null);
  for (let p = 0; p < firstDay; p++) curWeek[p] = null;
  history.forEach((entry) => {
    curWeek[entry.day] = entry;
    if (entry.day === 6) { weeks.push(curWeek); curWeek = Array.from({ length: 7 }, () => null); }
  });
  if (curWeek.some((c) => c)) weeks.push(curWeek);

  return (
    <div className="dt-card" style={{ marginTop: 20, padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(255,184,108,0.10), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ padding: '18px 24px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#6272A4', fontSize: 12, fontFamily: 'var(--dt-font-mono)' }}>// streak</span>
          <span style={{ color: 'var(--dt-text)', fontSize: 14, fontWeight: 500 }}>daily.ts</span>
          <span style={{ color: 'var(--dt-text-3)', fontSize: 12 }}>·</span>
          <span style={{ color: 'var(--dt-text-2)', fontSize: 12 }}>{t('Daily challenge streak')}</span>
        </div>
        <span className="dt-caption">{t('Last')} {stats.days} {t('days')}</span>
      </div>
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'center', position: 'relative' }}>
        <div className="dt-stack" style={{ gap: 18 }}>
          <div style={{ padding: '18px 20px', borderRadius: 8, background: 'rgba(255,184,108,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,184,108,0.25), inset 0 1px 0 rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ color: 'var(--dt-warning)', display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 0 12px rgba(255,184,108,0.5))' }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                <path d="M12 2c1 3 4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1.5-3.5C10 9 9.5 7 12 2z" fill="currentColor" />
                <path d="M12 22a6 6 0 0 0 6-6c0-2-1-3.5-2-5-.5 1-1 2-2 2.5.5-1 .5-2 0-3-.5 1.5-2 2-2.5 4-.5 1 0 2.5 1 3.5-2 0-3-1-3.5-2.5C8 17 8 19 9 20.5c.8 1 1.8 1.5 3 1.5z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            <div className="dt-stack" style={{ gap: 2 }}>
              <span className="dt-label">{t('Current streak')}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 500, color: 'var(--dt-warning)', fontFamily: 'var(--dt-font-mono)', lineHeight: 1, textShadow: '0 0 18px rgba(255,184,108,0.35)' }} className="dt-tabular">{stats.current}</span>
                <span style={{ fontSize: 13, color: 'var(--dt-text-2)' }}>{t('days')}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[{ label: t('Best'), value: stats.best, suffix: t('days') }, { label: t('Submitted'), value: `${stats.total}/${stats.days}` }].map((s) => (
              <div key={s.label} style={{ padding: '12px 14px', borderRadius: 6, background: 'var(--dt-hover)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 0 0 1px var(--dt-border)' }}>
                <div className="dt-label" style={{ marginBottom: 4 }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="dt-mono dt-tabular" style={{ fontSize: 20, color: 'var(--dt-text)' }}>{s.value}</span>
                  {'suffix' in s && s.suffix && <span style={{ fontSize: 11, color: 'var(--dt-text-2)' }}>{s.suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--dt-font-mono)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap, paddingTop: 0, color: 'var(--dt-text-3)', fontSize: 10, justifyContent: 'space-around' }}>
              {DAY_LABELS.map((d, i) => (
                <span key={i} style={{ height: cell, lineHeight: `${cell}px`, visibility: (i % 2) ? 'visible' : 'hidden' }}>{d}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap, flex: 1 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap }}>
                  {week.map((cellData, di) => <ContributionCell key={di} cell={cellData} size={cell} />)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: 80, color: 'var(--dt-text-3)', fontSize: 10 }}>
              <span>{t('Less')}</span>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {[0, 1, 2, 3, 4].map((lv) => <div key={lv} style={{ width: cell - 2, height: cell - 2, background: levelBg(lv), borderRadius: 2, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)' }} />)}
              </div>
              <span>{t('More')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyPage = () => {
  return (
    <div className="dt-page">
      <ProfileHeader />
      <StreakCard />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 20, marginTop: 24 }}>
        <div className="dt-stack" style={{ gap: 20 }}>
          <SummaryStats />
          <RatingHistoryCard />
          <RecentBattlesCard />
        </div>
        <div className="dt-stack" style={{ gap: 20 }}>
          <LanguageStatsCard />
          <ChallengeHistoryCard />
          <TierProgressCard />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
