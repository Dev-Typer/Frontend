import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { GithubMark } from '@/components/icons/Icons';
import SectionHead from '@/components/SectionHead';
import TypingEngine from '@/components/TypingEngine';
import CodePreview from '@/components/CodePreview';
import { IconCode, IconRefresh, IconPlay, IconSettings, IconArrowRight, IconKeyboard } from '@/components/icons/Icons';
import type { TypingProgress, TypingResult } from '@/types';
import { getRandomSnippet, type Snippet, type SnippetLanguage, type SnippetDifficulty } from '@/apis/snippetApi';
import { saveSnippetResult, getSnippetResultStats, type SnippetResultResponse, type SnippetResultStats } from '@/apis/snippetResultApi';
import WpmGraph from '@/components/WpmGraph';
import TypoHeatmap from '@/components/TypoHeatmap';
import RankSlideWidget from '@/components/RankSlideWidget';

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
                {l.logo ? <img src={l.logo} alt={l.label} style={{ width: 20, height: 20, objectFit: 'contain' }} /> : <span style={{ fontSize: 16 }}>⚙</span>}
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

const StatCard = ({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) => (
  <div className="dt-card" style={{ padding: '16px 20px' }}>
    <div className="dt-label" style={{ marginBottom: 6, fontSize: 10 }}>{label}</div>
    <div className="dt-mono dt-tabular" style={{ fontSize: 28, fontWeight: 600, color: accent ? 'var(--dt-primary)' : 'var(--dt-text)', lineHeight: 1 }}>{value}</div>
    {sub && <div className="dt-caption" style={{ marginTop: 6, color: 'var(--dt-text-3)' }}>{sub}</div>}
  </div>
);

const SoloResult = ({ result, snippet, savedResult, onNext, onChangeSettings }: SoloResultProps) => {
  const t = useT();
  const navigate = useNavigate();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const userId = useUserStore((s) => s.userId);
  const avgWpm = Math.round(snippet.avgWpm) || 0;
  const [stats, setStats] = useState<SnippetResultStats | null>(null);

  useEffect(() => {
    if (!savedResult) return;
    getSnippetResultStats(savedResult.id)
      .then(setStats)
      .catch(() => {});
  }, [savedResult]);

  // typo markers: 각 오타의 타임스탬프를 초로 변환
  const typoMarkers = useMemo(() => result.typos.map((typo) => {
    const event = result.replayData.find((e) => e.index === typo.index);
    return event ? { second: Math.ceil(event.timestamp / 1000) } : null;
  }).filter(Boolean) as { second: number }[], [result]);

  // 1. Raw WPM vs WPM 비교 데이터 (replayData 기반 초당 계산)
  const dualWpmData = useMemo(() => {
    const totalSec = Math.ceil(result.elapsed / 1000);
    const wpmLine: number[] = [];
    const rawLine: number[] = [];
    for (let sec = 1; sec <= totalSec; sec++) {
      const events = result.replayData.filter((e) => e.timestamp <= sec * 1000);
      const correct = events.filter((e) => e.correct).length;
      const raw = events.length;
      const t = sec / 60;
      wpmLine.push(Math.round((correct / 5) / t));
      rawLine.push(Math.round((raw / 5) / t));
    }
    return { wpmLine, rawLine };
  }, [result]);

  // 2. 시간대별 정확도 (초당 누적 정확도)
  // 3. 자주 틀린 글자 (expected 기준 top 10)
  const typoFreqBars = useMemo(() => {
    const freq = new Map<string, number>();
    result.typos.forEach((t) => {
      const ch = t.expected === ' ' ? '⎵' : t.expected === '\n' ? '↵' : t.expected;
      freq.set(ch, (freq.get(ch) ?? 0) + 1);
    });
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([label, value]) => ({ label, value, color: 'var(--dt-error)' }));
  }, [result]);


  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 className="dt-h2" style={{ margin: 0, color: 'var(--dt-primary)' }}>완료!</h2>
          {savedResult && stats && (
            <span className="dt-caption" style={{ color: 'var(--dt-text-3)' }}>
              ✓ 저장됨
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}>{t('Change settings')}</button>
          <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={onNext}><IconRefresh size={14} /> {t('New snippet')}</button>
        </div>
      </div>

      {/* 비로그인 유도 배너 */}
      {!isLoggedIn && (
        <div style={{ marginBottom: 16, padding: '14px 20px', background: 'color-mix(in oklab, var(--dt-primary) 6%, transparent)', borderRadius: 'var(--dt-radius-md)', border: '0.5px solid color-mix(in oklab, var(--dt-primary) 25%, transparent)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dt-text)', marginBottom: 2 }}>기록이 저장되지 않았습니다</div>
            <div style={{ fontSize: 12, color: 'var(--dt-text-2)' }}>GitHub로 로그인하면 결과가 저장되고 랭킹에 올라갑니다.</div>
          </div>
          <button
            className="dt-btn dt-btn-sm"
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#24292f', color: '#fff', border: 0, flexShrink: 0 }}
          >
            <GithubMark size={15} fill="#fff" /> 로그인하고 저장하기
          </button>
        </div>
      )}

      {/* Stats — 5개 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
        <StatCard label="WPM" value={result.wpm} sub={avgWpm > 0 ? `평균 ${avgWpm}` : undefined} accent />
        <StatCard label="총 타수" value={result.rawWpm} />
        <StatCard label="정확도" value={`${result.acc.toFixed(1)}%`} sub={`${result.errors}회 오타`} />
        <StatCard label="최장 연속 정타" value={result.longestCombo} sub="글자" />
        <StatCard label="소요 시간" value={`${(result.elapsed / 1000).toFixed(1)}s`} sub={`${snippet.content.length}자`} />
      </div>

      {/* 랭킹 슬라이드 위젯 — 그래프 위에 전체 폭 */}
      {isLoggedIn && savedResult && userId && (
        <div className="dt-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="dt-label" style={{ marginBottom: 14, fontSize: 10 }}>스니펫 랭킹</div>
          <RankSlideWidget snippetId={snippet.id} userId={userId} myWpm={result.wpm} />
        </div>
      )}

      {/* 메인 타수 그래프 — WPM + 총타수 + 오타 마커 통합 */}
      {(stats?.wpmGraph.length ?? 0) > 1 && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--dt-border)' }}>
            <span className="dt-h3" style={{ margin: 0 }}>타수 그래프</span>
          </div>
          <div style={{ padding: '8px 20px 16px' }}>
            <WpmGraph
              wpmData={stats!.wpmGraph}
              rawWpmData={dualWpmData.rawLine}
              typoMarkers={typoMarkers}
            />
          </div>
        </div>
      )}

      {/* 자주 틀린 글자 */}
      {typoFreqBars.length > 0 && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--dt-border)' }}>
            <span className="dt-h3" style={{ margin: 0 }}>자주 틀린 글자</span>
          </div>
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {typoFreqBars.slice(0, 8).map((bar, i) => {
              const pct = (bar.value / typoFreqBars[0].value) * 100;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="dt-mono" style={{ width: 28, fontSize: 11, color: 'var(--dt-text-3)', textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                  <span className="dt-mono" style={{ width: 32, fontSize: 14, color: 'var(--dt-error)', fontWeight: 700, flexShrink: 0 }}>{bar.label}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--dt-hover)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--dt-error)', borderRadius: 999, opacity: 0.65 }} />
                  </div>
                  <span className="dt-mono" style={{ width: 32, fontSize: 12, textAlign: 'right', color: 'var(--dt-text-3)', flexShrink: 0 }}>{bar.value}회</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Typo Heatmap + Inline Replay */}
      <div className="dt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--dt-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="dt-h3" style={{ margin: 0 }}>오타 위치 분석</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(220,38,38,0.3)', borderRadius: 2, border: '1px solid rgba(220,38,38,0.5)' }} />
            <span style={{ color: 'var(--dt-text-3)' }}>오타 위치</span>
          </span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <TypoHeatmap content={snippet.content} typos={result.typos} replayData={result.replayData} />
        </div>
      </div>

      {/* Typo List */}
      {result.typos.length > 0 && (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '12px 20px', borderBottom: '0.5px solid var(--dt-border)' }}>
            <span className="dt-h3" style={{ margin: 0 }}>오타 목록 ({result.typos.length}개)</span>
          </div>
          <div style={{ padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
            {result.typos.map((typo, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'var(--dt-hover)', borderRadius: 4, fontFamily: 'var(--dt-font-mono)', fontSize: 12 }}>
                <span style={{ color: 'var(--dt-text-3)', fontSize: 10 }}>#{typo.index}</span>
                <span style={{ color: 'var(--dt-error)', textDecoration: 'line-through' }}>{typo.expected === ' ' ? '·' : typo.expected}</span>
                <span style={{ color: 'var(--dt-text-3)' }}>→</span>
                <span style={{ color: 'var(--dt-text-2)' }}>{typo.typed === ' ' ? '·' : typo.typed}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best / Worst Words */}
      {stats && (stats.wordStats.bestWords.length > 0 || stats.wordStats.worstWords.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {stats.wordStats.bestWords.length > 0 && (
            <div className="dt-card" style={{ padding: 16 }}>
              <div className="dt-label" style={{ marginBottom: 8, color: 'var(--dt-success)', fontSize: 10 }}>잘 치는 단어</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {stats.wordStats.bestWords.map((w) => (
                  <span key={w} className="dt-mono" style={{ fontSize: 12, padding: '2px 8px', background: 'color-mix(in oklab, var(--dt-success) 12%, transparent)', borderRadius: 4, color: 'var(--dt-success)' }}>{w}</span>
                ))}
              </div>
            </div>
          )}
          {stats.wordStats.worstWords.length > 0 && (
            <div className="dt-card" style={{ padding: 16 }}>
              <div className="dt-label" style={{ marginBottom: 8, color: 'var(--dt-error)', fontSize: 10 }}>막히는 단어</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {stats.wordStats.worstWords.map((w) => (
                  <span key={w} className="dt-mono" style={{ fontSize: 12, padding: '2px 8px', background: 'color-mix(in oklab, var(--dt-error) 12%, transparent)', borderRadius: 4, color: 'var(--dt-error)' }}>{w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
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
    // wpm/rawWpm 최솟값 보정 (0이면 유효성 검사 실패)
    const safeWpm = Math.max(r.wpm, 0.1);
    const safeRawWpm = Math.max(r.rawWpm, 0.1);
    try {
      const saved = await saveSnippetResult({
        snippetId: snippet.id, wpm: safeWpm, rawWpm: safeRawWpm,
        accuracy: r.acc, durationSec, typos: r.typos, replayData: r.replayData,
      });
      setSavedResult(saved);
    } catch (err) {
      console.error('[결과 저장 실패]', err);
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
