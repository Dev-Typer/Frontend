import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';

const SectionRule = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3.5 pt-9 px-7 pb-1 text-dt-text-3">
    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-dt-text-2">// {label}</span>
    <span className="flex-1 h-px bg-dt-border" />
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
    className={`inline-flex items-center py-2.5 px-4 border-0 rounded font-dt-mono text-[13px] font-medium cursor-default transition-[transform,box-shadow,filter] duration-[120ms] hover:-translate-y-px hover:brightness-110 ${
      primary
        ? 'bg-dt-primary text-[#0D0E12] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_0_rgba(0,0,0,0.5),0_6px_16px_-6px_rgba(80,250,123,0.5)]'
        : 'bg-dt-card text-dt-text shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_var(--dt-border),0_1px_0_rgba(0,0,0,0.5)]'
    }`}
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
    <div className="grid grid-cols-5 rounded-md overflow-hidden bg-dt-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_var(--dt-border),0_1px_0_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.6)]">
      {items.map((s, i) => (
        <div key={s.k} className={`py-3.5 px-[18px] ${i > 0 ? 'shadow-[inset_1px_0_0_var(--dt-border)]' : 'shadow-none'}`}>
          <div className="text-dt-text-3 text-[11px] mb-1.5">
            <span className="text-[#6272A4]">// {s.k}</span>
          </div>
          <div className="flex items-baseline gap-2">
            {s.live && <span className="w-1.5 h-1.5 rounded-full bg-dt-error shadow-[0_0_8px_rgba(255,85,85,0.7)] inline-block" />}
            <span className="dt-tabular text-[22px] font-medium text-dt-primary">{s.v}</span>
            <span className="text-[11px] text-dt-text-2">{s.hint}</span>
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
    <div className="rounded-md overflow-hidden bg-dt-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_var(--dt-border),0_1px_0_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.6)]">
      {items.map((it, i) => (
        <div
          key={it.file}
          onClick={() => navigate(it.route)}
          className={`grid grid-cols-[230px_1fr_130px] items-center gap-4 py-3.5 px-5 cursor-default transition-colors duration-150 hover:bg-dt-hover ${i > 0 ? 'shadow-[inset_0_1px_0_var(--dt-border)]' : 'shadow-none'}`}
        >
          <div className="text-[13px]">
            <span className="text-[#FF79C6]">import</span>{' '}
            <span className="text-dt-text-2">{`{`}</span>{' '}
            <span className="text-[#50FA7B]">{it.fn}</span>{' '}
            <span className="text-dt-text-2">{`}`}</span>{' '}
            <span className="text-[#FF79C6]">from</span>{' '}
            <span className="text-[#F1FA8C]">"./{it.file}"</span>
          </div>
          <div>
            <div className="text-[13px] text-dt-text">{it.label}</div>
            <div className="text-xs text-dt-text-2 mt-0.5">{it.desc}</div>
          </div>
          <div className="text-right">
            <TermBtn onClick={() => navigate(it.route)} primary>
              <span className="text-[#0D0E12]">{it.fn}</span>
              <span className="text-[rgba(13,14,18,0.7)]">()</span>
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
    <div className="dt-tabular text-4xl text-dt-primary tracking-[0.02em] font-dt-mono [text-shadow:0_0_16px_rgba(80,250,123,0.25)]">
      {String(hh).padStart(2,'0')}:{String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}
    </div>
  );
};

const DailyWidget = ({ navigate }: { navigate: (r: string) => void }) => {
  const t = useT();
  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-3.5">
      <div className="bg-dt-card rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_var(--dt-border),0_8px_24px_-16px_rgba(0,0,0,0.6)] py-4 px-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-[200px] h-[200px] pointer-events-none bg-[radial-gradient(circle,rgba(80,250,123,0.12),transparent_70%)]" />
        <div className="relative">
          <div className="text-[#6272A4] text-[11.5px] mb-2">// {t("Today's challenge")} · TypeScript · medium</div>
          <div className="text-[13.5px] leading-[1.75]">
            <div><span className="text-[#8BE9FD]">const</span>{' '}<span className="text-[#F1FA8C]">todaysChallenge</span>{' '}<span className="text-dt-text-2">=</span>{' '}<span className="text-dt-text-2">{`{`}</span></div>
            <div className="pl-[22px] text-dt-text-2">
              date: <span className="text-[#F1FA8C]">"2026-05-27"</span>,<br/>
              submissions: <span className="text-[#BD93F9]">4218</span>,<br/>
              attemptsLeft: <span className="text-[#BD93F9]">1</span>,
            </div>
            <div><span className="text-dt-text-2">{`}`}</span>;</div>
          </div>
          <div className="mt-3.5">
            <TermBtn onClick={() => navigate('/daily')} primary>
              <span className="text-[#0D0E12]">challenge.submit</span>
              <span className="text-[rgba(13,14,18,0.7)]">()</span>
            </TermBtn>
          </div>
        </div>
      </div>
      <div className="bg-dt-card rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_var(--dt-border),0_8px_24px_-16px_rgba(0,0,0,0.6)] py-4 px-5 flex flex-col justify-between">
        <div>
          <div className="text-[#6272A4] text-[11.5px] mb-1.5">// {t('Resets in')}</div>
          <ResetCountdown />
        </div>
        <div className="mt-3.5 py-2 px-3 rounded bg-[rgba(255,184,108,0.08)] shadow-[inset_0_0_0_1px_rgba(255,184,108,0.25)] text-[#FFB86C] text-xs">
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
    <div className="max-w-[920px] pt-10 pb-[60px]">
      <div className="px-7 pb-7 relative">
        <div className="flex items-center gap-3.5 mb-2">
          <img src="/assets/logo.png" alt="" width={48} height={48} className="block -my-2.5" />
          <span className="text-[#6272A4] text-sm"># DevTyper</span>
        </div>
        <h1 className="m-0 font-dt-mono text-[44px] font-medium tracking-[-0.02em] leading-[1.1]">
          {t('Race the code you actually write.')}
        </h1>
        <p className="mt-[18px] text-[15px] leading-[1.65] max-w-[580px] text-dt-text-2">
          {t('A typing platform for developers — JavaScript, Python, Go, Java, SQL & TypeScript. Measure your speed, race up to 3 devs live, climb the global ladder.')}
        </p>
        <div className="mt-6 flex gap-2.5 flex-wrap">
          <TermBtn onClick={() => navigate('/solo')} primary>$ devtyper start</TermBtn>
          <TermBtn onClick={() => navigate('/battle')}>$ devtyper battle --quick</TermBtn>
          <TermBtn onClick={() => navigate('/daily')}>$ devtyper daily</TermBtn>
        </div>
      </div>

      <SectionRule label="Live" />
      <div className="pt-5 px-7">
        <LiveStrip onlineLive={onlineLive} />
      </div>

      <SectionRule label="Modes" />
      <div className="pt-5 px-7">
        <ModeList navigate={navigate} />
      </div>

      <SectionRule label="Today" />
      <div className="pt-5 px-7 pb-8">
        <DailyWidget navigate={navigate} />
      </div>
    </div>
  );
};

export default HomeEditor;
