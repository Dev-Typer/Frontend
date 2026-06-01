import { useState, useEffect, useCallback } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import SectionHead from '@/components/SectionHead';
import TypingEngine from '@/components/TypingEngine';
import CodePreview from '@/components/CodePreview';
import { IconCode, IconRefresh, IconPlay, IconSettings, IconArrowRight, IconArrowUp, IconArrowDown, IconKeyboard } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';
import { getRandomSnippet, type Snippet, type SnippetLanguage, type SnippetDifficulty } from '@/apis/snippetApi';
import { saveSnippetResult, type SnippetResultResponse } from '@/apis/snippetResultApi';

type Phase = 'setup' | 'typing' | 'result';

const LANGS: { id: SnippetLanguage; label: string; logo: string | null }[] = [
  { id: 'JAVASCRIPT', label: 'JavaScript', logo: '/lang/js.png'     },
  { id: 'PYTHON',     label: 'Python',     logo: '/lang/python.png' },
  { id: 'JAVA',       label: 'Java',       logo: '/lang/java.png'   },
  { id: 'CPP',        label: 'C++',        logo: null               },
];

const DIFFS: { id: SnippetDifficulty; label: string; chars: string }[] = [
  { id: 'EASY',   label: 'Easy',   chars: '~80 chars'  },
  { id: 'MEDIUM', label: 'Medium', chars: '~180 chars' },
  { id: 'HARD',   label: 'Hard',   chars: '~320 chars' },
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
  lang: SnippetLanguage; setLang: (l: SnippetLanguage) => void;
  diff: SnippetDifficulty; setDiff: (d: SnippetDifficulty) => void;
  onStart: () => void; snippet: Snippet | null;
  loading: boolean; onShuffle: () => void;
}

const SoloSetup = ({ lang, setLang, diff, setDiff, onStart, snippet, loading, onShuffle }: SoloSetupProps) => {
  const t = useT();
  return (
    <div>
      <SectionHead kicker="Solo practice" title="Pick a language. Type at your pace." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="dt-card">
          <div className="dt-label" style={{ marginBottom: 10 }}>{t('Language')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 0, borderRadius: 'var(--dt-radius)', cursor: 'pointer', fontFamily: 'inherit', background: lang === l.id ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)' : 'var(--dt-hover)', boxShadow: lang === l.id ? 'inset 0 0 0 1px var(--dt-primary)' : 'none' }}>
                {l.logo ? <img src={l.logo} alt={l.label} style={{ width: 20, height: 20, objectFit: 'contain' }} /> : <span style={{ fontSize: 16 }}>@{''}</span>}
                <span style={{ fontSize: 13, fontWeight: lang === l.id ? 600 : 400, color: lang === l.id ? 'var(--dt-primary)' : 'var(--dt-text-2)' }}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="dt-card">
          <div className="dt-label" style={{ marginBottom: 10 }}>{t('Difficulty')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFS.map((d) => (
              <button key={d.id} onClick={() => setDiff(d.id)} className="dt-stack"
                style={{ flex: 1, padding: '12px 14px', border: 0, cursor: 'pointer', background: diff === d.id ? 'color-mix(in oklab, var(--dt-primary) 12%, transparent)' : 'var(--dt-hover)', borderRadius: 'var(--dt-radius)', textAlign: 'left', boxShadow: diff === d.id ? 'inset 0 0 0 1px var(--dt-primary)' : 'none', color: 'var(--dt-text)', fontFamily: 'inherit', alignItems: 'flex-start', gap: 4 }}>
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
            {snippet && <span className="dt-caption">@ {LANGS.find((l) => l.id === lang)?.label} @ {t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>}
          </div>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onShuffle} disabled={loading}>
            <IconRefresh size={14} /> {t('Shuffle')}
          </button>
        </div>
        {loading
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--dt-text-3)', fontFamily: 'var(--dt-font-mono)', fontSize: 13 }}>loading...</div>
          : snippet
            ? <CodePreview code={snippet.content} fontSize={15} />
            : <div style={{ padding: 40, textAlign: 'center', color: 'var(--dt-text-3)', fontSize: 13 }}>No snippets found.</div>
        }
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onStart} disabled={!snippet || loading}>
          <IconPlay size={16} /> {t('Start typing')}
        </button>
      </div>
      <div style={{ marginTop: 24, color: 'var(--dt-text-2)' }} className="dt-caption">
        <IconKeyboard size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {t('Tip: focus on accuracy first — fixed mistakes still count against your accuracy score.')}
      </div>
    </div>
  );
};

interface SoloTypingProps {
  snippet: Snippet; lang: SnippetLanguage; diff: SnippetDifficulty;
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
          <span className="dt-h2" style={{ margin: 0 }}>{t('Solo')} @ {LANGS.find((l) => l.id === lang)?.label}</span>
          <span className="dt-chip">{t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}><IconSettings size={14} /> {t('Settings')}</button>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onReset}><IconRefresh size={14} /> {t('Restart')}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <LiveStat label="WPM" value={progress.wpm} accent />
        <LiveStat label="Accuracy" value={progress.acc.toFixed(0)} unit="%" />
        <LiveStat label="Time" value={(progress.elapsed / 1000).toFixed(1)} unit="s" />
        <LiveStat label="Progress" value={`${progress.index}/${progress.total}`} />
      </div>
      <div className="dt-progress" style={{ marginBottom: 24, height: 4 }}>
        <div style={{ width: `${(progress.index / Math.max(1, progress.total)) * 100}%` }} />
      </div>
      <TypingEngine code={snippet.content} resetKey={resetKey} caretStyle={caret}
        fontSize={density === 'compact' ? 16 : 18} onProgress={setProgress} onFinish={onFinish} />
      <div style={{ marginTop: 20, color: 'var(--dt-text-2)', textAlign: 'center' }} className="dt-caption">
        Press <kbd style={kbd}>Esc</kbd> to pause @ <kbd style={kbd}>Tab</kbd> + <kbd style={kbd}>Enter</kbd> to restart
      </div>
    </div>
  );
};

interface SoloResultProps {
  result: TypingResult; snippet: Snippet;
  savedResult: SnippetResultResponse | null;
  onNext: () => void; onChangeSettings: () => void;
}

const SoloResult = ({ result, snippet, savedResult, onNext, onChangeSettings }: SoloResultProps) => {
  const t = useT();
  const avgWpm = Math.round(snippet.avgWpm) || 0;
  const delta = result.wpm - avgWpm;
  const barMax = Math.max(result.wpm * 1.5, 160);
  return (
    <div>
      <SectionHead kicker="Result" title="Run complete." action={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
          <button className="dt-btn dt-btn-primary" onClick={onNext}><IconRefresh size={16} /> {t('New snippet')}</button>
        </div>
      } />
      {savedResult && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: 'color-mix(in oklab, var(--dt-primary) 8%, transparent)', borderRadius: 'var(--dt-radius)', border: '0.5px solid color-mix(in oklab, var(--dt-primary) 30%, transparent)' }}>
          <span className="dt-caption" style={{ color: 'var(--dt-primary)' }}>checkmark 결과가 저장됐습니다</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('WPM')}</div>
          <div className="dt-display dt-mono dt-tabular" style={{ color: 'var(--dt-primary)' }}>{result.wpm}</div>
          {avgWpm > 0 && (
            <div className="dt-caption" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              {delta >= 0 ? <IconArrowUp size={14} style={{ color: 'var(--dt-success)' }} /> : <IconArrowDown size={14} style={{ color: 'var(--dt-error)' }} />}
              <span style={{ color: delta >= 0 ? 'var(--dt-success)' : 'var(--dt-error)' }}>{delta >= 0 ? '+' : ''}{delta}</span>
              <span>{t('vs snippet average')} ({avgWpm})</span>
            </div>
          )}
        </div>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('Accuracy')}</div>
          <div className="dt-display dt-mono dt-tabular">{result.acc.toFixed(1)}<span style={{ fontSize: 22, color: 'var(--dt-text-2)' }}>%</span></div>
          <div className="dt-caption" style={{ marginTop: 8 }}>{result.errors} {t('mistakes corrected')}</div>
        </div>
        <div className="dt-card" style={{ padding: 24 }}>
          <div className="dt-label" style={{ marginBottom: 6 }}>{t('Time')}</div>
          <div className="dt-display dt-mono dt-tabular">{(result.elapsed / 1000).toFixed(1)}<span style={{ fontSize: 22, color: 'var(--dt-text-2)' }}>s</span></div>
          <div className="dt-caption" style={{ marginTop: 8 }}>{snippet.content.length} {t('chars typed')}</div>
        </div>
      </div>
      {avgWpm > 0 && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '0.5px solid var(--dt-border)' }}>
            <span className="dt-h3" style={{ margin: 0 }}>{t('How you compare')}</span>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <ComparisonBar label={t('You')} value={result.wpm} max={barMax} color="var(--dt-primary)" />
            <ComparisonBar label={t('Snippet average')} value={avgWpm} max={barMax} color="var(--dt-text-3)" />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 12 }}>
        <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change language / difficulty')}</button>
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}><IconArrowRight size={16} /> {t('Try another snippet')}</button>
      </div>
    </div>
  );
};

const Solo = () => {
  const [lang, setLang] = useState<SnippetLanguage>('JAVASCRIPT');
  const [diff, setDiff] = useState<SnippetDifficulty>('MEDIUM');
  const [phase, setPhase] = useState<Phase>('setup');
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedResult, setSavedResult] = useState<SnippetResultResponse | null>(null);

  const loadSnippet = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getRandomSnippet(lang, diff);
      setSnippet(s);
    } catch {
      setSnippet(null);
    } finally {
      setLoading(false);
    }
  }, [lang, diff]);

  useEffect(() => { loadSnippet(); }, [loadSnippet]);

  const start = () => { setPhase('typing'); setResult(null); setSavedResult(null); setResetKey((k) => k + 1); };

  const onFinish = async (r: TypingResult) => {
    setResult(r);
    setPhase('result');
    if (!snippet) return;
    const durationSec = Math.round(r.elapsed / 1000);
    if (durationSec < 3) return;
    try {
      const saved = await saveSnippetResult({
        snippetId: snippet.id, wpm: r.wpm, rawWpm: r.rawWpm,
        accuracy: r.acc, durationSec, typos: r.typos, replayData: r.replayData,
      });
      setSavedResult(saved);
    } catch {
      // 비로그인 또는 저장 실패 무시
    }
  };

  const next = () => { loadSnippet(); setPhase('typing'); setResult(null); setSavedResult(null); setResetKey((k) => k + 1); };

  return (
    <div className="dt-page-narrow">
      {phase === 'setup' && (
        <SoloSetup lang={lang} setLang={setLang} diff={diff} setDiff={setDiff}
          onStart={start} snippet={snippet} loading={loading} onShuffle={loadSnippet} />
      )}
      {phase === 'typing' && snippet && (
        <SoloTyping snippet={snippet} lang={lang} diff={diff}
          progress={progress} setProgress={setProgress} onFinish={onFinish}
          resetKey={resetKey} onReset={() => setResetKey((k) => k + 1)}
          onChangeSettings={() => setPhase('setup')} />
      )}
      {phase === 'result' && result && snippet && (
        <SoloResult result={result} snippet={snippet} savedResult={savedResult}
          onNext={next} onChangeSettings={() => setPhase('setup')} />
      )}
    </div>
  );
};

export default Solo;
