import { useState, useEffect } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { TODAYS_CHALLENGE, CHALLENGE_BOARD } from '@/data';
import SectionHead from '@/components/SectionHead';
import TypingEngine from '@/components/TypingEngine';
import CodePreview from '@/components/CodePreview';
import Avatar from '@/components/Avatar';
import Stat from '@/components/Stat';
import { IconClock, IconCalendar, IconBolt, IconPlay, IconTrophy, IconChevronRight } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';

type Phase = 'intro' | 'typing' | 'result';

const DailyResultCard = ({ result }: { result: TypingResult }) => {
  const t = useT();
  const myRank = CHALLENGE_BOARD.filter((r) => r.wpm > result.wpm).length + 1;
  return (
    <div className="dt-card" style={{ padding: 32, textAlign: 'center' }}>
      <IconTrophy size={32} style={{ color: 'var(--dt-primary)', marginBottom: 16 }} />
      <h2 className="dt-h1" style={{ margin: 0, marginBottom: 8 }}>{t('Challenge submitted.')}</h2>
      <p className="dt-body-sm" style={{ color: 'var(--dt-text-2)', marginBottom: 28 }}>
        {t("You'll see your final position when the day closes. Live rank shown below.")}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
        <Stat label="WPM" value={result.wpm} accent />
        <Stat label="Accuracy" value={result.acc.toFixed(1)} unit="%" />
        <Stat label="Live rank" value={`#${myRank}`} />
        <Stat label="Time" value={(result.elapsed / 1000).toFixed(1)} unit="s" />
      </div>
    </div>
  );
};

const DailyLeaderboard = () => (
  <div className="dt-card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'flex-start' }}>
    <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="dt-h3" style={{ margin: 0 }}>Live leaderboard</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="dt-live-dot" />
        <span className="dt-caption">4,218 today</span>
      </span>
    </div>
    <div style={{ padding: 8 }}>
      {CHALLENGE_BOARD.map((r) => (
        <div key={r.handle} style={{ display: 'grid', gridTemplateColumns: '38px 1fr auto auto', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: r.me ? 'color-mix(in oklab, var(--dt-primary) 8%, transparent)' : 'transparent' }}>
          <span className="dt-mono" style={{ color: r.rank <= 3 ? 'var(--dt-primary)' : 'var(--dt-text-2)', fontSize: 13 }}>#{r.rank}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Avatar handle={r.handle} hue={(r.handle.charCodeAt(0) * 7) % 360} size={24} />
            <span className="dt-mono" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.handle}</span>
          </div>
          <span className="dt-mono dt-tabular" style={{ fontSize: 13, minWidth: 36, textAlign: 'right' }}>{r.wpm}</span>
          <span className="dt-mono dt-tabular dt-caption" style={{ minWidth: 36, textAlign: 'right' }}>{r.acc}%</span>
        </div>
      ))}
      <div style={{ textAlign: 'center', padding: 12 }}>
        <button className="dt-btn dt-btn-secondary dt-btn-sm">View top 100 <IconChevronRight size={14} /></button>
      </div>
    </div>
  </div>
);

const Daily = () => {
  const t = useT();
  const caret = useAppStore((s) => s.caret);
  const density = useAppStore((s) => s.density);
  const isLoggedIn = useAppStore((s) => s.loggedIn);
  const ch = TODAYS_CHALLENGE;
  const [phase, setPhase] = useState<Phase>('intro');
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((tt) => tt + 1), 1000); return () => clearInterval(id); }, []);
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setHours(24, 0, 0, 0);
  const msLeft = tomorrow.getTime() - now.getTime();
  const hLeft = Math.floor(msLeft / 3600000);
  const mLeft = Math.floor((msLeft / 60000) % 60);
  const sLeft = Math.floor((msLeft / 1000) % 60);

  const start = () => { setPhase('typing'); setResetKey((k) => k + 1); };
  const onFinish = (r: TypingResult) => { setResult(r); setPhase('result'); };

  return (
    <div className="dt-page">
      <SectionHead
        kicker="Today's Challenge"
        title={`${ch.language} · ${ch.difficulty}`}
        action={
          <div className="dt-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconClock size={16} style={{ color: 'var(--dt-warning)' }} />
            <div className="dt-stack" style={{ gap: 0 }}>
              <span className="dt-caption" style={{ fontSize: 11 }}>{t('Resets in')}</span>
              <span className="dt-mono dt-tabular" style={{ fontSize: 14 }}>
                {String(hLeft).padStart(2,'0')}:{String(mLeft).padStart(2,'0')}:{String(sLeft).padStart(2,'0')}
              </span>
            </div>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: phase === 'typing' ? '1fr' : '1.5fr 1fr', gap: 20 }}>
        <div>
          {phase === 'intro' && (
            <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconCalendar size={18} style={{ color: 'var(--dt-primary)' }} />
                  <span className="dt-h3" style={{ margin: 0 }}>{ch.date}</span>
                  <span className="dt-chip">{ch.language}</span>
                  <span className="dt-chip">{ch.difficulty}</span>
                </div>
                <span className="dt-caption">{ch.code.length} {t('chars')}</span>
              </div>
              <CodePreview code={ch.code} fontSize={15} />
              <div style={{ padding: '20px 24px', borderTop: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="dt-caption" style={{ color: 'var(--dt-warning)' }}>
                  <IconBolt size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {t('You only get one attempt today.')}
                </div>
                <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={start} disabled={!isLoggedIn}>
                  <IconPlay size={16} /> {t('Start challenge')}
                </button>
              </div>
            </div>
          )}
          {phase === 'typing' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontFamily: 'var(--dt-font-mono)' }}>
                <span className="dt-label" style={{ color: 'var(--dt-error)' }}>
                  <span className="dt-live-dot" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {t('CHALLENGE LIVE')}
                </span>
                <div style={{ display: 'flex', gap: 24 }}>
                  <span><span style={{ color: 'var(--dt-primary)', fontSize: 22, fontWeight: 500 }} className="dt-tabular">{progress.wpm}</span> wpm</span>
                  <span><span className="dt-tabular" style={{ fontSize: 16 }}>{progress.acc.toFixed(0)}</span>%</span>
                  <span><span className="dt-tabular" style={{ fontSize: 16 }}>{(progress.elapsed / 1000).toFixed(1)}</span>s</span>
                </div>
              </div>
              <div className="dt-progress" style={{ marginBottom: 16, height: 4 }}>
                <div style={{ width: `${(progress.index / Math.max(1, progress.total)) * 100}%` }} />
              </div>
              <TypingEngine code={ch.code} resetKey={resetKey} caretStyle={caret} fontSize={density === 'compact' ? 16 : 18} onProgress={setProgress} onFinish={onFinish} />
            </div>
          )}
          {phase === 'result' && result && <DailyResultCard result={result} />}
        </div>
        {phase !== 'typing' && <DailyLeaderboard />}
      </div>
    </div>
  );
};

export default Daily;
