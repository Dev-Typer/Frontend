import { useState, useMemo } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { CODE_SNIPPETS } from '@/data';
import SectionHead from '@/components/SectionHead';
import TypingEngine from '@/components/TypingEngine';
import CodePreview from '@/components/CodePreview';
import Pill from '@/components/Pill';
import { IconCode, IconRefresh, IconPlay, IconSettings, IconArrowRight, IconArrowUp, IconArrowDown, IconKeyboard } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';

type Phase = 'setup' | 'typing' | 'result';

const LANGS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'go',         label: 'Go'         },
  { id: 'java',       label: 'Java'       },
  { id: 'sql',        label: 'SQL'        },
];

const DIFFS = [
  { id: 'easy',   label: 'Easy',   chars: '~80 chars'  },
  { id: 'medium', label: 'Medium', chars: '~180 chars' },
  { id: 'hard',   label: 'Hard',   chars: '~320 chars' },
];

const kbd: React.CSSProperties = { display: 'inline-block', padding: '1px 6px', margin: '0 2px', background: 'var(--dt-hover)', border: '0.5px solid var(--dt-border)', borderRadius: 4, fontFamily: 'var(--dt-font-mono)', fontSize: 11, color: 'var(--dt-text-2)' };

const LiveStat = ({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: boolean }) => {
  const t = useT();
  return (
    <div className="dt-card" style={{ padding: '14px 18px' }}>
      <div className="dt-label" style={{ marginBottom: 4 }}>{t(label)}</div>
      <div className="dt-mono" style={{ fontSize: 28, fontWeight: 500, color: accent ? 'var(--dt-primary)' : 'var(--dt-text)' }}>
        <span className="dt-tabular">{value}</span>
        {unit && <span style={{ fontSize: 14, color: 'var(--dt-text-2)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
};

const ComparisonBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="dt-body-sm">{label}</span>
      <span className="dt-mono dt-tabular" style={{ fontSize: 14, color }}>{value} wpm</span>
    </div>
    <div style={{ height: 8, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 999, transition: 'width 600ms ease-out' }} />
    </div>
  </div>
);

interface SoloSetupProps {
  lang: string; setLang: (l: string) => void;
  diff: string; setDiff: (d: string) => void;
  onStart: () => void; snippet: string;
}

const SoloSetup = ({ lang, setLang, diff, setDiff, onStart, snippet }: SoloSetupProps) => {
  const t = useT();
  return (
    <div>
      <SectionHead kicker="Solo practice" title="Pick a language. Type at your pace." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="dt-card">
          <div className="dt-label" style={{ marginBottom: 10 }}>{t('Language')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LANGS.map((l) => <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</Pill>)}
          </div>
        </div>
        <div className="dt-card">
          <div className="dt-label" style={{ marginBottom: 10 }}>{t('Difficulty')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFS.map((d) => (
              <button key={d.id} onClick={() => setDiff(d.id)} className="dt-stack" style={{ flex: 1, padding: '12px 14px', border: 0, cursor: 'default', background: diff === d.id ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)' : 'var(--dt-hover)', borderRadius: 'var(--dt-radius)', textAlign: 'left', boxShadow: diff === d.id ? 'inset 0 0 0 1px var(--dt-primary)' : 'none', color: 'var(--dt-text)', fontFamily: 'inherit', alignItems: 'flex-start', gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: diff === d.id ? 'var(--dt-primary)' : 'var(--dt-text)' }}>{t(d.label)}</span>
                <span className="dt-caption" style={{ color: 'var(--dt-text-2)' }}>{t(d.chars)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="dt-card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--dt-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconCode size={18} style={{ color: 'var(--dt-primary)' }} />
            <span className="dt-h3" style={{ margin: 0 }}>{t('Preview')}</span>
            <span className="dt-caption">· {LANGS.find((l) => l.id === lang)?.label} · {t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>
          </div>
          <button className="dt-btn dt-btn-secondary dt-btn-sm"><IconRefresh size={14} /> {t('Shuffle')}</button>
        </div>
        <CodePreview code={snippet} fontSize={15} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onStart}><IconPlay size={16} /> {t('Start typing')}</button>
      </div>
      <div style={{ marginTop: 24, color: 'var(--dt-text-2)' }} className="dt-caption">
        <IconKeyboard size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {t('Tip: focus on accuracy first — fixed mistakes still count against your accuracy score.')}
      </div>
    </div>
  );
};

interface SoloTypingProps {
  snippet: string; lang: string; diff: string;
  progress: TypingProgress; setProgress: (p: TypingProgress) => void;
  onFinish: (r: TypingResult) => void;
  resetKey: number; onReset: () => void; onChangeSettings: () => void;
}

const SoloTyping = ({ snippet, lang, diff, progress, setProgress, onFinish, resetKey, onReset, onChangeSettings }: SoloTypingProps) => {
  const t = useT();
  const caret = useAppStore((s) => s.caret);
  const density = useAppStore((s) => s.density);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="dt-h2" style={{ margin: 0 }}>{t('Solo')} · {LANGS.find((l) => l.id === lang)?.label}</span>
          <span className="dt-chip">{t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}><IconSettings size={14} /> {t('Settings')}</button>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onReset}><IconRefresh size={14} /> {t('Restart')}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <LiveStat label="WPM"      value={progress.wpm} accent />
        <LiveStat label="Accuracy" value={progress.acc.toFixed(0)} unit="%" />
        <LiveStat label="Time"     value={(progress.elapsed / 1000).toFixed(1)} unit="s" />
        <LiveStat label="Progress" value={`${progress.index}/${progress.total}`} />
      </div>
      <div className="dt-progress" style={{ marginBottom: 24, height: 4 }}>
        <div style={{ width: `${(progress.index / Math.max(1, progress.total)) * 100}%` }} />
      </div>
      <TypingEngine code={snippet} resetKey={resetKey} caretStyle={caret} fontSize={density === 'compact' ? 16 : 18} onProgress={setProgress} onFinish={onFinish} />
      <div style={{ marginTop: 20, color: 'var(--dt-text-2)', textAlign: 'center' }} className="dt-caption">
        Press <kbd style={kbd}>Esc</kbd> to pause · <kbd style={kbd}>Tab</kbd> + <kbd style={kbd}>Enter</kbd> to restart
      </div>
    </div>
  );
};

interface SoloResultProps {
  result: TypingResult; lang: string; diff: string;
  onNext: () => void; onChangeSettings: () => void; snippet: string;
}

const SoloResult = ({ result, onNext, onChangeSettings, snippet }: SoloResultProps) => {
  const t = useT();
  const avgWpm = 78;
  const delta = result.wpm - avgWpm;
  return (
    <div>
      <SectionHead kicker="Result" title="Run complete." action={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
          <button className="dt-btn dt-btn-primary" onClick={onNext}><IconRefresh size={16} /> {t('New snippet')}</button>
        </div>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('WPM')}</div>
          <div className="dt-display dt-mono dt-tabular" style={{ color: 'var(--dt-primary)' }}>{result.wpm}</div>
          <div className="dt-caption" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {delta >= 0 ? <IconArrowUp size={14} style={{ color: 'var(--dt-success)' }} /> : <IconArrowDown size={14} style={{ color: 'var(--dt-error)' }} />}
            <span style={{ color: delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>{delta >= 0 ? '+' : ''}{delta}</span>
            <span>{t('vs snippet average')} ({avgWpm})</span>
          </div>
        </div>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('Accuracy')}</div>
          <div className="dt-display dt-mono dt-tabular">{result.acc.toFixed(1)}<span style={{ fontSize: 22, color: 'var(--dt-text-2)' }}>%</span></div>
          <div className="dt-caption" style={{ marginTop: 8 }}>{result.errors} {t('mistakes corrected')}</div>
        </div>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('Time')}</div>
          <div className="dt-display dt-mono dt-tabular">{(result.elapsed / 1000).toFixed(1)}<span style={{ fontSize: 22, color: 'var(--dt-text-2)' }}>s</span></div>
          <div className="dt-caption" style={{ marginTop: 8 }}>{snippet.length} {t('chars typed')}</div>
        </div>
      </div>
      <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--dt-border)' }}>
          <span className="dt-h3" style={{ margin: 0 }}>{t('How you compare')}</span>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <ComparisonBar label={t('You')} value={result.wpm} max={160} color="var(--dt-primary)" />
          <ComparisonBar label={t('Snippet average')} value={avgWpm} max={160} color="var(--dt-text-3)" />
          <ComparisonBar label={t('Your platinum tier avg')} value={92} max={160} color="var(--dt-platinum-fg)" />
          <ComparisonBar label={t('Top 1% on this snippet')} value={148} max={160} color="var(--dt-warning)" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 12 }}>
        <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change language / difficulty')}</button>
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}><IconArrowRight size={16} /> {t('Try another snippet')}</button>
      </div>
    </div>
  );
};

const Solo = () => {
  const [lang, setLang] = useState('javascript');
  const [diff, setDiff] = useState('medium');
  const [phase, setPhase] = useState<Phase>('setup');
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);

  const snippet = useMemo(() => {
    const pool = (CODE_SNIPPETS[lang]?.[diff]) ?? CODE_SNIPPETS.javascript.medium;
    return pool[0];
  }, [lang, diff, resetKey]);

  const start = () => { setPhase('typing'); setResult(null); setResetKey((k) => k + 1); };
  const onFinish = (r: TypingResult) => { setResult(r); setPhase('result'); };
  const next = () => { setResetKey((k) => k + 1); setPhase('typing'); setResult(null); };

  return (
    <div className="dt-page-narrow">
      {phase === 'setup' && <SoloSetup lang={lang} setLang={setLang} diff={diff} setDiff={setDiff} onStart={start} snippet={snippet} />}
      {phase === 'typing' && <SoloTyping snippet={snippet} lang={lang} diff={diff} progress={progress} setProgress={setProgress} onFinish={onFinish} resetKey={resetKey} onReset={() => setResetKey((k) => k + 1)} onChangeSettings={() => setPhase('setup')} />}
      {phase === 'result' && result && <SoloResult result={result} lang={lang} diff={diff} onNext={next} onChangeSettings={() => setPhase('setup')} snippet={snippet} />}
    </div>
  );
};

export default Solo;
