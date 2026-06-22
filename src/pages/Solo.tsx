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

const kbdClass = 'inline-block py-px px-1.5 mx-0.5 bg-dt-hover border-[0.5px] border-dt-border rounded font-dt-mono text-[11px] text-dt-text-2';

const LiveStat = ({ label, value, unit, accent }: { label: string; value: string | number; unit?: string; accent?: boolean }) => {
  const t = useT();
  return (
    <div className="dt-card py-3.5 px-[18px]">
      <div className="dt-label mb-1">{t(label)}</div>
      <div className={`dt-mono text-[28px] font-medium ${accent ? 'text-dt-primary' : 'text-dt-text'}`}>
        <span className="dt-tabular">{value}</span>
        {unit && <span className="text-sm text-dt-text-2 ml-1">{unit}</span>}
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
      <div className="grid grid-cols-2 gap-5">
        <div className="dt-card">
          <div className="dt-label mb-2.5">{t('Language')}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)}
                className={`flex items-center gap-2 py-2 px-2.5 border-0 rounded-dt cursor-default font-[inherit] ${lang === l.id ? 'bg-[color-mix(in_oklab,var(--dt-primary)_12%,transparent)] shadow-[inset_0_0_0_1px_var(--dt-primary)]' : 'bg-dt-hover shadow-none'}`}>
                {l.logo ? <img src={l.logo} alt={l.label} className="w-5 h-5 object-contain" /> : <span className="text-base">⚙</span>}
                <span className={`text-[13px] ${lang === l.id ? 'font-semibold text-dt-primary' : 'font-normal text-dt-text-2'}`}>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="dt-card">
          <div className="dt-label mb-2.5">{t('Difficulty')}</div>
          <div className="flex gap-2">
            {DIFFS.map((d) => (
              <button key={d.id} onClick={() => setDiff(d.id)}
                className={`dt-stack flex-1 py-3 px-3.5 border-0 cursor-default rounded-dt text-left text-dt-text font-[inherit] items-start gap-1 ${diff === d.id ? 'bg-[color-mix(in_oklab,var(--dt-primary)_12%,transparent)] shadow-[inset_0_0_0_1px_var(--dt-primary)]' : 'bg-dt-hover shadow-none'}`}>
                <span className={`font-medium text-sm ${diff === d.id ? 'text-dt-primary' : 'text-dt-text'}`}>{t(d.label)}</span>
                <span className="dt-caption text-dt-text-2">{t(d.chars)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="dt-card mt-5 p-0 overflow-hidden">
        <div className="py-4 px-5 flex items-center justify-between border-b-[0.5px] border-dt-border">
          <div className="flex items-center gap-3">
            <IconCode size={18} className="text-dt-primary" />
            <span className="dt-h3 m-0">{t('Preview')}</span>
            {snippet && <span className="dt-caption">@ {LANGS.find((l) => l.id === lang)?.label} @ {t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>}
          </div>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onShuffle} disabled={loading}>
            <IconRefresh size={14} /> {t('Shuffle')}
          </button>
        </div>
        {loading
          ? <div className="p-10 text-center text-dt-text-3 font-dt-mono text-[13px]">loading...</div>
          : snippet
            ? <CodePreview code={snippet.content} fontSize={15} />
            : <div className="p-10 text-center text-dt-text-3 text-[13px]">No snippets found.</div>
        }
      </div>
      <div className="flex justify-end mt-6">
        <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onStart} disabled={!snippet || loading}>
          <IconPlay size={16} /> {t('Start typing')}
        </button>
      </div>
      <div className="dt-caption mt-6 text-dt-text-2">
        <IconKeyboard size={14} className="align-middle mr-1.5" />
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3.5">
          <span className="dt-h2 m-0">{t('Solo')} @ {LANGS.find((l) => l.id === lang)?.label}</span>
          <span className="dt-chip">{t(DIFFS.find((d) => d.id === diff)?.label ?? '')}</span>
        </div>
        <div className="flex gap-2">
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}><IconSettings size={14} /> {t('Settings')}</button>
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onReset}><IconRefresh size={14} /> {t('Restart')}</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <LiveStat label="WPM" value={progress.wpm} accent />
        <LiveStat label="Accuracy" value={progress.acc.toFixed(0)} unit="%" />
        <LiveStat label="Time" value={(progress.elapsed / 1000).toFixed(1)} unit="s" />
        <LiveStat label="Progress" value={`${progress.index}/${progress.total}`} />
      </div>
      <div className="dt-progress mb-6 h-1">
        <div style={{ width: `${(progress.index / Math.max(1, progress.total)) * 100}%` }} />
      </div>
      <TypingEngine code={snippet.content} resetKey={resetKey} caretStyle={caret}
        fontSize={density === 'compact' ? 16 : 18} onProgress={setProgress} onFinish={onFinish} />
      <div className="dt-caption mt-5 text-dt-text-2 text-center">
        Press <kbd className={kbdClass}>Esc</kbd> to pause @ <kbd className={kbdClass}>Tab</kbd> + <kbd className={kbdClass}>Enter</kbd> to restart
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
  <div className="dt-card py-4 px-5">
    <div className="dt-label mb-1.5 text-[10px]">{label}</div>
    <div className={`dt-mono dt-tabular text-[28px] font-semibold leading-none ${accent ? 'text-dt-primary' : 'text-dt-text'}`}>{value}</div>
    {sub && <div className="dt-caption mt-1.5 text-dt-text-3">{sub}</div>}
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="dt-h2 m-0 text-dt-primary">완료!</h2>
          {savedResult && stats && (
            <span className="dt-caption text-dt-text-3">
              ✓ 저장됨
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}>{t('Change settings')}</button>
          <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={onNext}><IconRefresh size={14} /> {t('New snippet')}</button>
        </div>
      </div>

      {/* 비로그인 유도 배너 */}
      {!isLoggedIn && (
        <div className="mb-4 py-3.5 px-5 bg-[color-mix(in_oklab,var(--dt-primary)_6%,transparent)] rounded-dt-md border-[0.5px] border-[color-mix(in_oklab,var(--dt-primary)_25%,transparent)] flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-dt-text mb-0.5">기록이 저장되지 않았습니다</div>
            <div className="text-xs text-dt-text-2">GitHub로 로그인하면 결과가 저장되고 랭킹에 올라갑니다.</div>
          </div>
          <button
            className="dt-btn dt-btn-sm flex items-center gap-2 bg-[#24292f] text-white border-0 shrink-0"
            onClick={() => navigate('/login')}
          >
            <GithubMark size={15} fill="#fff" /> 로그인하고 저장하기
          </button>
        </div>
      )}

      {/* Stats — 5개 */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <StatCard label="WPM" value={result.wpm} sub={avgWpm > 0 ? `평균 ${avgWpm}` : undefined} accent />
        <StatCard label="총 타수" value={result.rawWpm} />
        <StatCard label="정확도" value={`${result.acc.toFixed(1)}%`} sub={`${result.errors}회 오타`} />
        <StatCard label="최장 연속 정타" value={result.longestCombo} sub="글자" />
        <StatCard label="소요 시간" value={`${(result.elapsed / 1000).toFixed(1)}s`} sub={`${snippet.content.length}자`} />
      </div>

      {/* 랭킹 슬라이드 위젯 — 그래프 위에 전체 폭 */}
      {isLoggedIn && savedResult && userId && (
        <div className="dt-card p-5 mb-4">
          <div className="dt-label mb-3.5 text-[10px]">스니펫 랭킹</div>
          <RankSlideWidget snippetId={snippet.id} userId={userId} myWpm={result.wpm} myUsername={useUserStore.getState().username ?? '나'} />
        </div>
      )}

      {/* 메인 타수 그래프 — WPM + 총타수 + 오타 마커 통합 */}
      {(stats?.wpmGraph.length ?? 0) > 1 && (
        <div className="dt-card p-0 overflow-hidden mb-4">
          <div className="py-3 px-5 border-b-[0.5px] border-dt-border">
            <span className="dt-h3 m-0">타수 그래프</span>
          </div>
          <div className="pt-2 px-5 pb-4">
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
        <div className="dt-card p-0 overflow-hidden mb-4">
          <div className="py-3 px-5 border-b-[0.5px] border-dt-border">
            <span className="dt-h3 m-0">자주 틀린 글자</span>
          </div>
          <div className="py-2.5 px-4 flex flex-col gap-1.5">
            {typoFreqBars.slice(0, 8).map((bar, i) => {
              const pct = (bar.value / typoFreqBars[0].value) * 100;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="dt-mono w-7 text-[11px] text-dt-text-3 text-right shrink-0">#{i + 1}</span>
                  <span className="dt-mono w-8 text-sm text-dt-error font-bold shrink-0">{bar.label}</span>
                  <div className="flex-1 h-1.5 bg-dt-hover rounded-full overflow-hidden">
                    <div className="h-full bg-dt-error rounded-full opacity-[0.65]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dt-mono w-8 text-xs text-right text-dt-text-3 shrink-0">{bar.value}회</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Typo Heatmap + Inline Replay */}
      <div className="dt-card p-0 overflow-hidden mb-4">
        <div className="py-3 px-5 border-b-[0.5px] border-dt-border flex items-center gap-3">
          <span className="dt-h3 m-0">오타 위치 분석</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block w-2.5 h-2.5 bg-[rgba(220,38,38,0.3)] rounded-sm border border-[rgba(220,38,38,0.5)]" />
            <span className="text-dt-text-3">오타 위치</span>
          </span>
        </div>
        <div className="py-4 px-5">
          <TypoHeatmap content={snippet.content} typos={result.typos} replayData={result.replayData} />
        </div>
      </div>

      {/* Typo List */}
      {result.typos.length > 0 && (
        <div className="dt-card p-0 overflow-hidden mb-4">
          <div className="py-3 px-5 border-b-[0.5px] border-dt-border">
            <span className="dt-h3 m-0">오타 목록 ({result.typos.length}개)</span>
          </div>
          <div className="py-2 px-5 flex flex-wrap gap-2 max-h-[140px] overflow-y-auto">
            {result.typos.map((typo, i) => (
              <div key={i} className="flex items-center gap-1 py-[3px] px-2.5 bg-dt-hover rounded font-dt-mono text-xs">
                <span className="text-dt-text-3 text-[10px]">#{typo.index}</span>
                <span className="text-dt-error line-through">{typo.expected === ' ' ? '·' : typo.expected}</span>
                <span className="text-dt-text-3">→</span>
                <span className="text-dt-text-2">{typo.typed === ' ' ? '·' : typo.typed}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best / Worst Words */}
      {stats && (stats.wordStats.bestWords.length > 0 || stats.wordStats.worstWords.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.wordStats.bestWords.length > 0 && (
            <div className="dt-card p-4">
              <div className="dt-label mb-2 text-[10px] text-dt-success">잘 치는 단어</div>
              <div className="flex flex-wrap gap-1.5">
                {stats.wordStats.bestWords.map((w) => (
                  <span key={w} className="dt-mono text-xs py-0.5 px-2 bg-[color-mix(in_oklab,var(--dt-success)_12%,transparent)] rounded text-dt-success">{w}</span>
                ))}
              </div>
            </div>
          )}
          {stats.wordStats.worstWords.length > 0 && (
            <div className="dt-card p-4">
              <div className="dt-label mb-2 text-[10px] text-dt-error">막히는 단어</div>
              <div className="flex flex-wrap gap-1.5">
                {stats.wordStats.worstWords.map((w) => (
                  <span key={w} className="dt-mono text-xs py-0.5 px-2 bg-[color-mix(in_oklab,var(--dt-error)_12%,transparent)] rounded text-dt-error">{w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
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
