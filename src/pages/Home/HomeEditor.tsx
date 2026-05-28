import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';

const SectionRule = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '36px 28px 4px', color: 'var(--dt-text-3)' }}>
    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dt-text-2)' }}>// {label}</span>
    <span style={{ flex: 1, height: 1, background: 'var(--dt-border)' }} />
  </div>
);

interface TermBtnProps {
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
}

const TermBtn = ({ onClick, children, primary }: TermBtnProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', padding: '10px 16px',
      background: primary ? 'var(--dt-primary)' : 'var(--dt-card)',
      color: primary ? '#0D0E12' : 'var(--dt-text)',
      boxShadow: primary
        ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 0 rgba(0,0,0,0.5), 0 6px 16px -6px rgba(80,250,123,0.5)'
        : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px var(--dt-border), 0 1px 0 rgba(0,0,0,0.5)',
      border: 0, borderRadius: 4,
      fontFamily: 'var(--dt-font-mono)', fontSize: 13, fontWeight: 500,
      cursor: 'default',
      transition: 'transform 120ms ease-out, box-shadow 120ms ease-out, filter 120ms',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)'; }}
  >
    {children}
  </button>
);

const LiveStrip = ({ onlineLive }: { onlineLive: number }) => {
  const items = [
    { k: 'online',   v: onlineLive, hint: '+12%' },
    { k: 'in_match', v: 37,         hint: 'live', live: true },
    { k: 'queue',    v: '~8s',      hint: 'avg wait' },
    { k: 'snippets', v: '1,420',    hint: 'curated' },
    { k: 'races',    v: '12,847',   hint: 'today' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderRadius: 6, overflow: 'hidden', background: 'var(--dt-card)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px var(--dt-border), 0 1px 0 rgba(0,0,0,0.3), 0 8px 24px -16px rgba(0,0,0,0.6)' }}>
      {items.map((s, i) => (
        <div key={s.k} style={{ padding: '14px 18px', boxShadow: i > 0 ? 'inset 1px 0 0 var(--dt-border)' : 'none' }}>
          <div style={{ color: 'var(--dt-text-3)', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: '#6272A4' }}>// {s.k}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {s.live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--dt-error)', boxShadow: '0 0 8px rgba(255,85,85,0.7)', display: 'inline-block' }} />}
            <span className="dt-tabular" style={{ fontSize: 22, fontWeight: 500, color: 'var(--dt-primary)' }}>{s.v}</span>
            <span style={{ fontSize: 11, color: 'var(--dt-text-2)' }}>{s.hint}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ModeList = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  const items = [
    { route: '/solo',   file: 'solo.ts',   fn: 'practice', label: t('Solo Practice'),    desc: t('At your own pace. Measured.') },
    { route: '/battle', file: 'battle.ts', fn: 'battle',   label: t('Real-time Battle'), desc: t('Up to 3 devs. Live ratings.') },
    { route: '/daily',  file: 'daily.ts',  fn: 'daily',    label: t("Today's challenge"), desc: t('One snippet, one attempt.') },
  ];
  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', background: 'var(--dt-card)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px var(--dt-border), 0 1px 0 rgba(0,0,0,0.3), 0 8px 24px -16px rgba(0,0,0,0.6)' }}>
      {items.map((it, i) => (
        <div
          key={it.file}
          onClick={() => navigate(it.route)}
          style={{ display: 'grid', gridTemplateColumns: '230px 1fr 130px', alignItems: 'center', gap: 16, padding: '14px 20px', boxShadow: i > 0 ? 'inset 0 1px 0 var(--dt-border)' : 'none', cursor: 'default', transition: 'background 150ms' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--dt-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        >
          <div style={{ fontSize: 13 }}>
            <span style={{ color: '#FF79C6' }}>import</span>{' '}
            <span style={{ color: 'var(--dt-text-2)' }}>{`{`}</span>{' '}
            <span style={{ color: '#50FA7B' }}>{it.fn}</span>{' '}
            <span style={{ color: 'var(--dt-text-2)' }}>{`}`}</span>{' '}
            <span style={{ color: '#FF79C6' }}>from</span>{' '}
            <span style={{ color: '#F1FA8C' }}>"./{it.file}"</span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--dt-text)' }}>{it.label}</div>
            <div style={{ fontSize: 12, color: 'var(--dt-text-2)', marginTop: 2 }}>{it.desc}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <TermBtn onClick={() => navigate(it.route)} primary>
              <span style={{ color: '#0D0E12' }}>{it.fn}</span>
              <span style={{ color: 'rgba(13,14,18,0.7)' }}>()</span>
            </TermBtn>
          </div>
        </div>
      ))}
    </div>
  );
};

const ResetCountdown = () => {
  const [ts, setTs] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setTs(Date.now()), 1000); return () => clearInterval(id); }, []);
  const now = new Date(ts);
  const tom = new Date(now); tom.setHours(24, 0, 0, 0);
  const ms = tom.getTime() - now.getTime();
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor((ms / 60000) % 60);
  const ss = Math.floor((ms / 1000) % 60);
  return (
    <div className="dt-tabular" style={{ fontSize: 36, color: 'var(--dt-primary)', letterSpacing: '0.02em', fontFamily: 'var(--dt-font-mono)', textShadow: '0 0 16px rgba(80,250,123,0.25)' }}>
      {String(hh).padStart(2,'0')}:{String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}
    </div>
  );
};

const DailyWidget = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
      <div style={{ background: 'var(--dt-card)', borderRadius: 6, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px var(--dt-border), 0 8px 24px -16px rgba(0,0,0,0.6)', padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(80,250,123,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ color: '#6272A4', fontSize: 11.5, marginBottom: 8 }}>// {t("Today's challenge")} · TypeScript · medium</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.75 }}>
            <div><span style={{ color: '#8BE9FD' }}>const</span>{' '}<span style={{ color: '#F1FA8C' }}>todaysChallenge</span>{' '}<span style={{ color: 'var(--dt-text-2)' }}>=</span>{' '}<span style={{ color: 'var(--dt-text-2)' }}>{`{`}</span></div>
            <div style={{ paddingLeft: 22, color: 'var(--dt-text-2)' }}>
              date: <span style={{ color: '#F1FA8C' }}>"2026-05-27"</span>,<br/>
              submissions: <span style={{ color: '#BD93F9' }}>4218</span>,<br/>
              attemptsLeft: <span style={{ color: '#BD93F9' }}>1</span>,
            </div>
            <div><span style={{ color: 'var(--dt-text-2)' }}>{`}`}</span>;</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <TermBtn onClick={() => navigate('/daily')} primary>
              <span style={{ color: '#0D0E12' }}>challenge.submit</span>
              <span style={{ color: 'rgba(13,14,18,0.7)' }}>()</span>
            </TermBtn>
          </div>
        </div>
      </div>
      <div style={{ background: 'var(--dt-card)', borderRadius: 6, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px var(--dt-border), 0 8px 24px -16px rgba(0,0,0,0.6)', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#6272A4', fontSize: 11.5, marginBottom: 6 }}>// {t('Resets in')}</div>
          <ResetCountdown />
        </div>
        <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 4, background: 'rgba(255,184,108,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,184,108,0.25)', color: '#FFB86C', fontSize: 12 }}>
          ⚠ {t('not submitted')} · {t('1 attempt left')}
        </div>
      </div>
    </div>
  );
};

const HomeEditor = () => {
  const t = useT();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(id); }, []);
  const onlineLive = 428 + Math.round(Math.sin(tick * 0.3) * 6);

  return (
    <div style={{ maxWidth: 920, padding: '40px 0 60px' }}>
      <div style={{ padding: '0 28px 28px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <img src="/assets/logo.png" alt="" width={48} height={48} style={{ display: 'block', margin: '-10px 0' }} />
          <span style={{ color: '#6272A4', fontSize: 14 }}># DevTyper</span>
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--dt-font-mono)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {t('Race the code you actually write.')}
        </h1>
        <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.65, maxWidth: 580, color: 'var(--dt-text-2)' }}>
          {t('A typing platform for developers — JavaScript, Python, Go, Java, SQL & TypeScript. Measure your speed, race up to 3 devs live, climb the global ladder.')}
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <TermBtn onClick={() => navigate('/solo')} primary>$ devtyper start</TermBtn>
          <TermBtn onClick={() => navigate('/battle')}>$ devtyper battle --quick</TermBtn>
          <TermBtn onClick={() => navigate('/daily')}>$ devtyper daily</TermBtn>
        </div>
      </div>

      <SectionRule label="Live" />
      <div style={{ padding: '20px 28px 0' }}>
        <LiveStrip onlineLive={onlineLive} />
      </div>

      <SectionRule label="Modes" />
      <div style={{ padding: '20px 28px 0' }}>
        <ModeList navigate={navigate} />
      </div>

      <SectionRule label="Today" />
      <div style={{ padding: '20px 28px 32px' }}>
        <DailyWidget navigate={navigate} />
      </div>
    </div>
  );
};

export default HomeEditor;
