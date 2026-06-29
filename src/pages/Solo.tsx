import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { computeCore, CoreFactor, WpmGraph, MistypedLetters, WordChips } from '@/components/result';
import TypoHeatmap from '@/components/TypoHeatmap';
import TypingEngine from '@/components/TypingEngine';
import RaceProgress from '@/components/RaceProgress';
import { useT } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import SectionHead from '@/components/SectionHead';
import Pill from '@/components/Pill';
import Avatar from '@/components/Avatar';
import StatCard from '@/components/StatCard';
import {
  IconPlay, IconRefresh, IconSettings, IconKeyboard, IconArrowRight, IconArrowUp, IconArrowDown,
} from '@/components/icons/Icons';
import type { TypingProgress, TypingResult, SoloTrack } from '@/types';
import { LANG_ICON } from '@/data';
import coreLogo from '@/assets/core-logo.png';
import { getPublicSnippet, getRandomSnippet } from '@/apis/snippetApi';
import type { SnippetLanguage } from '@/apis/snippetApi';
import { saveSnippetResult, getSnippetRanking } from '@/apis/snippetResultApi';
import type { RankingItem } from '@/apis/snippetResultApi';

type Phase = 'setup' | 'typing' | 'result';

const LANGS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'go',         label: 'Go'         },
  { id: 'java',       label: 'Java'       },
  { id: 'kotlin',     label: 'Kotlin'     },
  { id: 'c++',        label: 'C++'        },
  { id: 'c#',         label: 'C#'         },
  { id: 'c',          label: 'C'          },
  { id: 'rust',       label: 'Rust'       },
];
const DIFFS = [
  { id: 'easy',   label: 'Easy',   chars: '~80 chars'  },
  { id: 'medium', label: 'Medium', chars: '~180 chars' },
  { id: 'hard',   label: 'Hard',   chars: '~320 chars' },
];


function toLangKey(lang: SnippetLanguage): string {
  return lang.toLowerCase();
}

const UI_TO_API_LANG: Record<string, SnippetLanguage> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  go: 'Go', java: 'Java', kotlin: 'Kotlin',
  'c++': 'C++', 'c#': 'C#', c: 'C', rust: 'Rust',
};

// ─── Setup ────────────────────────────────────────────────────────────────────
interface SoloSetupProps {
  lang: string; setLang: (l: string) => void; onStart: () => void;
}

const SoloSetup = ({ lang, setLang, onStart }: SoloSetupProps) => {
  const t = useT();
  const langLabel = LANGS.find((l) => l.id === lang)?.label;
  return (
    <div className="pt-2">
      <SectionHead kicker="Solo practice" title="Pick a language. Start typing." />

      <div className="relative overflow-hidden rounded-dt-md py-10 px-10 pb-11 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--dt-card)_70%,transparent),color-mix(in_oklab,#2E6BFF_12%,transparent))] [backdrop-filter:blur(14px)_saturate(1.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_var(--dt-border),0_20px_52px_-28px_rgba(46,107,255,0.5)]">
        <div className="relative z-[2] max-w-[560px]">
          <div className="dt-label mb-3">{t('Language')}</div>
          <div className="flex flex-wrap gap-2 mb-7">
            {LANGS.map((l) => (
              <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>
                {LANG_ICON[l.id] && (
                  <img src={LANG_ICON[l.id]} alt="" className="w-[18px] h-[18px] object-contain align-middle inline-block mr-1" />
                )}
                {l.label}
              </Pill>
            ))}
          </div>

          <button className="dt-btn dt-btn-primary dt-btn-lg text-base px-7 min-h-[54px]" onClick={onStart}>
            <IconPlay size={18} /> {langLabel} {t('random start')}
          </button>
          <p className="dt-caption mt-3.5 max-w-[380px]">
            {t('A random snippet will be picked for the selected language.')}
          </p>
        </div>
      </div>

      <div className="dt-caption mt-[18px] text-dt-text-2">
        <IconKeyboard size={14} className="align-middle mr-1.5" />
        {t('Tip: focus on accuracy first — fixed mistakes still count against your accuracy score.')}
      </div>
    </div>
  );
};

// ─── Typing ───────────────────────────────────────────────────────────────────
interface SoloTypingProps {
  snippet: string; lang: string; diff: string; progress: TypingProgress; setProgress: (p: TypingProgress) => void;
  onFinish: (r: TypingResult) => void; resetKey: number;
  onReset: () => void; onChangeSettings: () => void; realLang: string;
}

const VISIBLE_LINES = 8;

const InlineStat = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
  <div className="flex flex-col items-end leading-none">
    <span className="dt-mono dt-tabular text-[22px] font-semibold text-dt-text">
      {value}<span className="text-[12px] text-dt-text-3">{unit}</span>
    </span>
    <span className="text-[9.5px] tracking-[0.07em] uppercase text-dt-text-3 mt-[3px]">{label}</span>
  </div>
);

const SoloTyping = ({ snippet, lang, diff, progress, setProgress, onFinish, resetKey, onReset, onChangeSettings, realLang }: SoloTypingProps) => {
  const t = useT();
  const caret = useAppStore((s) => s.caret);
  const density = useAppStore((s) => s.density);
  const { username, profileUrl } = useUserStore();
  const [typed, setTyped] = useState('');

  const dispLang = realLang || lang;
  const fontSize = density === 'compact' ? 16 : 19;
  const lh = Math.round(fontSize * 1.95);
  const lines = useMemo(() => snippet.split('\n'), [snippet]);
  const totalLines = lines.length;
  const wordCount = useMemo(() => snippet.trim().split(/\s+/).filter(Boolean).length, [snippet]);

  const frag = useMemo(() => typed.match(/(\S*)$/)?.[0] ?? '', [typed]);
  const activeLine = useMemo(() => snippet.slice(0, typed.length).split('\n').length - 1, [snippet, typed]);
  const pct = snippet.length ? (typed.length / snippet.length) * 100 : 0;

  const maxOffset = Math.max(0, totalLines - VISIBLE_LINES);
  const offset = Math.min(maxOffset, Math.max(0, activeLine - 3));
  const viewportH = VISIBLE_LINES * lh;
  const translateY = -(offset * lh);

  const gutterW = String(totalLines).length;
  const me = { handle: username ?? 'you', avatarHue: ((username ?? 'you').charCodeAt(0) * 7) % 360, src: profileUrl ?? undefined };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0" style={{ paddingBottom: 18 }}>
        <div className="flex items-center gap-3">
          {LANG_ICON[dispLang] && (
            <img src={LANG_ICON[dispLang]} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          )}
          <span className="font-dt-mono font-bold text-[15px] uppercase tracking-[0.06em] text-dt-text">
            {LANGS.find((l) => l.id === dispLang)?.label || dispLang}
          </span>
          <span className="dt-chip text-[11px]">{t(DIFFS.find((d) => d.id === diff.toLowerCase())?.label ?? '')}</span>
        </div>
        <div className="flex items-center gap-5">
          <InlineStat label={t('Accuracy')} value={progress.acc.toFixed(0)} unit="%" />
          <InlineStat label={t('Time')} value={(progress.elapsed / 1000).toFixed(0)} unit="s" />
          <div style={{ width: 1, height: 28, background: 'var(--dt-border)' }} />
          <button className="dt-btn dt-btn-secondary dt-btn-sm" onClick={onChangeSettings}>
            <IconSettings size={13} /> {t('설정')}
          </button>
        </div>
      </div>

      {/* ── Race progress bar ── */}
      <div style={{ marginBottom: 18 }}>
        <RaceProgress pct={pct} me={me} />
      </div>

      {/* ── WPM pill ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div className="dt-race-wpm">
          <span className="dt-race-checker" aria-hidden="true" />
          <span className="dt-mono dt-tabular" style={{ fontSize: 15 }}>
            {progress.wpm > 0 ? progress.wpm : '---'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--dt-text-3)' }}>wpm</span>
        </div>
      </div>

      {/* ── Scroll viewport ── */}
      <div className="dt-snip-viewport" style={{ height: viewportH, fontSize, fontFamily: 'var(--dt-font-mono)' }}>
        <div className="dt-snip-scroll" style={{ transform: `translateY(${translateY}px)` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${gutterW + 1.5}ch 1fr` }}>
            {/* Line numbers */}
            <div>
              {lines.map((_, i) => (
                <div key={i} style={{
                  height: lh, lineHeight: `${lh}px`,
                  textAlign: 'right', paddingRight: 18,
                  fontSize, fontFamily: 'var(--dt-font-mono)',
                  color: 'var(--dt-text-3)', opacity: 0.55, userSelect: 'none',
                  boxShadow: 'inset -1px 0 0 var(--dt-border)',
                }}>
                  {i + 1}
                </div>
              ))}
            </div>
            {/* TypingEngine */}
            <div style={{ paddingLeft: 18, overflow: 'hidden' }}>
              <TypingEngine
                code={snippet}
                resetKey={resetKey}
                caretStyle={caret}
                fontSize={fontSize}
                onProgress={setProgress}
                onFinish={onFinish}
                onTypedChange={setTyped}
                embedded
                noPadding
                noStatusBar
                noAutoScroll
              />
            </div>
          </div>
        </div>
        {offset > 0 && <div className="dt-snip-fade dt-snip-fade-top" />}
        {offset < maxOffset && <div className="dt-snip-fade dt-snip-fade-bot" />}
      </div>

      {/* ── Meta line ── */}
      <div className="dt-mono" style={{ padding: '12px 4px 0', fontSize: 12.5, color: 'var(--dt-text-3)', display: 'flex', gap: 10 }}>
        <span>{totalLines} {totalLines === 1 ? 'line' : 'lines'}</span>
        <span>/</span>
        <span>{wordCount} words</span>
        <span>/</span>
        <span>{snippet.length} chars</span>
        {totalLines > VISIBLE_LINES && (
          <span style={{ marginLeft: 'auto', color: 'var(--dt-text-2)' }}>
            {Math.min(activeLine + 1, totalLines)} / {totalLines}
          </span>
        )}
      </div>

      {/* ── Input row ── */}
      <div className="dt-type-inputrow" style={{ justifyContent: 'flex-start', padding: '22px 0 4px', gap: 12 }}>
        <div className="dt-type-input" style={{ width: 360 }}>
          <span className="dt-mono" style={{ fontSize: 16, color: 'var(--dt-text)', whiteSpace: 'pre' }}>{frag}</span>
          <span className="dt-type-caret" />
        </div>
        <button className="dt-type-iconbtn primary" title={t('다시')} onClick={(e) => { e.stopPropagation(); onReset(); }}>
          <IconRefresh size={18} />
        </button>
      </div>
    </div>
  );
};




// ─── Ranking section ──────────────────────────────────────────────────────────
const SnippetRankingSection = ({ snippetId, myCore }: { snippetId: number; myCore: number }) => {
  const t = useT();
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnippetRanking(snippetId)
      .then(res => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [snippetId]);

  return (
    <div style={{ padding: '40px 0 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="dt-label" style={{ marginBottom: 4 }}>{t('Leaderboard')}</div>
        <div className="dt-h2 m-0">{t('Snippet ranking')}</div>
        <div className="dt-caption" style={{ marginTop: 6 }}>{t('Best CORE per player — top 50')}</div>
      </div>

      {loading ? (
        <div className="dt-card" style={{ padding: 32, textAlign: 'center', color: 'var(--dt-text-3)' }}>
          {t('Loading ranking…')}
        </div>
      ) : items.length === 0 ? (
        <div className="dt-card" style={{ padding: 32, textAlign: 'center', color: 'var(--dt-text-3)' }}>
          {t('No rankings yet — be the first!')}
        </div>
      ) : (
        <div className="dt-card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((item, i) => {
            const isMe = item.core === myCore && i === 0;
            return (
              <div key={item.userId} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 100px 100px 80px', gap: 12,
                alignItems: 'center', padding: '11px 18px',
                background: isMe ? 'color-mix(in oklab, var(--dt-primary) 7%, transparent)' : 'transparent',
                boxShadow: i > 0 ? 'inset 0 1px 0 var(--dt-border)' : 'none',
              }}>
                <span className="dt-mono tabular-nums" style={{
                  fontSize: 14, fontWeight: item.rank <= 3 ? 700 : 500,
                  color: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : 'var(--dt-text-2)',
                }}>
                  #{item.rank}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar handle={item.username} hue={(item.username.charCodeAt(0) * 7) % 360} size={24} src={item.profileUrl ?? undefined} />
                  <span className="dt-mono" style={{ fontSize: 13, color: 'var(--dt-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.username}
                  </span>
                </div>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--dt-primary)' }}>
                  {Math.round(item.core)} <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--dt-text-3)', fontWeight: 400 }}><img src={coreLogo} style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.7 }} />CORE</span>
                </span>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 13, color: 'var(--dt-text-2)' }}>
                  {item.wpm} <span style={{ fontSize: 10 }}>WPM</span>
                </span>
                <span className="dt-mono tabular-nums" style={{ textAlign: 'right', fontSize: 13, color: 'var(--dt-text-3)' }}>
                  {item.accuracy.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Result ───────────────────────────────────────────────────────────────────
interface SoloResultProps {
  result: TypingResult; track: SoloTrack | null; diff: string;
  onNext: () => void; onChangeSettings: () => void; snippet: string;
  apiSnippetId?: number;
  savedCoreInfo?: { core: number; isNewBest: boolean; prevBestCore: number } | null;
  isLoggedIn?: boolean;
}

const SoloResult = ({ result, track, diff, onNext, onChangeSettings, snippet, apiSnippetId, savedCoreInfo, isLoggedIn }: SoloResultProps) => {
  const t = useT();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const section0Ref = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const sectionIdxRef = useRef(0);
  const wheelLockRef = useRef(false);

  const realDiff = track?.difficulty || diff;
  const { core: localCore, nWpm, diffW, lenW } = computeCore(result.wpm, result.acc, realDiff, snippet.length);

  // 백엔드 저장 결과 우선 사용, 없으면 로컬 계산값 fallback
  const core = savedCoreInfo?.core ?? localCore;
  const isNewBest = savedCoreInfo?.isNewBest ?? false;
  const prevBest = savedCoreInfo?.prevBestCore ?? 0;

  const sectionRefs = useMemo(() =>
    [section0Ref, section1Ref, ...(apiSnippetId ? [section2Ref] : [])],
    [apiSnippetId]
  );

  const goToSection = (idx: number) => {
    const el = sectionRefs[idx]?.current;
    if (!el || !containerRef.current) return;
    sectionIdxRef.current = idx;
    containerRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      if (wheelLockRef.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;

      // 이벤트 타겟에서 container까지 올라가며 내부 스크롤 가능 요소 확인
      let el = e.target as HTMLElement | null;
      while (el && el !== container) {
        const oy = window.getComputedStyle(el).overflowY;
        if (oy === 'auto' || oy === 'scroll') {
          if (dir === -1 && el.scrollTop > 0) return; // 위 스크롤: 내부 콘텐츠 먼저
          if (dir === 1 && el.scrollTop < el.scrollHeight - el.clientHeight - 1) return; // 아래 스크롤: 내부 콘텐츠 먼저
        }
        el = el.parentElement;
      }

      const next = Math.max(0, Math.min(sectionRefs.length - 1, sectionIdxRef.current + dir));
      if (next === sectionIdxRef.current) return;
      e.preventDefault();
      wheelLockRef.current = true;
      goToSection(next);
      setTimeout(() => { wheelLockRef.current = false; }, 750);
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [sectionRefs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionStyle: React.CSSProperties = {
    height: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column',
    padding: '0 max(24px, calc((100vw - 900px) / 2))',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'var(--dt-bg)',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
      }}
    >
      {/* ── Section 0: Stats ── */}
      <div ref={section0Ref} style={{ ...sectionStyle, scrollSnapAlign: 'start', paddingTop: 28, paddingBottom: 16, overflowY: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="dt-label" style={{ marginBottom: 2 }}>Result</div>
            <div className="dt-h2 m-0" style={{ fontSize: 24 }}>{t('Run complete.')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
            <button className="dt-btn dt-btn-primary" onClick={onNext}><IconRefresh size={16} /> {t('New snippet')}</button>
          </div>
        </div>

        {/* CORE hero */}
        <div className="dt-card p-0 overflow-hidden" style={{ marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="dt-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><img src={coreLogo} style={{ width: 19, height: 19, objectFit: 'contain' }} />{t('CORE this run')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span className="dt-mono dt-tabular" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, color: 'var(--dt-primary)' }}>{Math.round(core)}</span>
                {savedCoreInfo && (isNewBest ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: 'var(--dt-primary)', background: 'color-mix(in oklab, var(--dt-primary) 16%, transparent)', boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--dt-primary) 45%, transparent)' }}>🎉 {t('New best!')}</span>
                ) : (
                  <span className="dt-caption">{t('Best on this snippet')}: <span className="dt-mono" style={{ color: 'var(--dt-text)' }}>{Math.round(prevBest)}</span></span>
                ))}
              </div>
              <div className="dt-mono" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, color: 'var(--dt-text-2)' }}>
                <CoreFactor label="nWPM" value={nWpm} />
                <span style={{ color: 'var(--dt-text-3)' }}>×</span>
                <CoreFactor label={t(realDiff.toLowerCase() === 'easy' ? 'Easy' : realDiff.toLowerCase() === 'hard' ? 'Hard' : 'Medium')} value={diffW.toFixed(1)} />
                <span style={{ color: 'var(--dt-text-3)' }}>×</span>
                <CoreFactor label={t('Length')} value={lenW.toFixed(2)} />
              </div>
            </div>
            <div style={{ background: 'var(--dt-border)' }} />
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div className="dt-label">{t('Best on this snippet')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                {savedCoreInfo ? (
                  <>
                    <span className="dt-mono dt-tabular" style={{ fontSize: 28, fontWeight: 700, color: 'var(--dt-text)' }}>
                      {isNewBest ? Math.round(core) : Math.round(prevBest)}
                    </span>
                    {isNewBest && (
                      <span className="dt-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--dt-success)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconArrowUp size={13} /> +{Math.round(core - prevBest)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="dt-caption" style={{ fontSize: 13 }}>—</span>
                )}
              </div>
              {savedCoreInfo ? (
                <p className="dt-caption" style={{ marginTop: 4, lineHeight: 1.5, maxWidth: 280 }}>
                  {isNewBest ? t('This beat your previous best on this snippet, so it lifted your Total CORE.') : t('Only your best run per snippet counts. This run is saved to history but did not change Total CORE.')}
                </p>
              ) : !isLoggedIn ? (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p className="dt-caption" style={{ lineHeight: 1.5 }}>{t('Sign in to devtyper')}</p>
                  <button className="dt-btn dt-btn-primary dt-btn-sm" onClick={() => navigate('/login')} style={{ alignSelf: 'flex-start' }}>
                    {t('Sign in with GitHub')}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 5 stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 10 }}>
          <StatCard label={t('WPM')} value={result.wpm} info="1분 동안 올바르게 입력한 글자 수 ÷ 5. 5자를 표준 단어 1개로 계산한 속도입니다." />
          <StatCard label="더 정확히 쳤다면?" value={Math.round(result.wpm / Math.max(0.5, result.acc / 100))} info="같은 타이밍으로 모든 키를 정확히 눌렀을 때 나왔을 예상 WPM입니다. 오타가 없었다면 이 수치가 WPM이 됩니다." />
          <StatCard label={t('Accuracy')} value={result.acc.toFixed(1)} unit="%" sub={`${result.errors} ${t('mistakes corrected')}`} info="전체 키 입력 중 올바른 입력의 비율. 수정한 오타도 실수로 카운트됩니다." />
          <StatCard label={t('Longest combo')} value={result.longestCombo} unit="x" info="오타 없이 연속으로 입력한 최대 글자 수입니다. 한 글자라도 틀리면 콤보가 리셋됩니다." />
          <StatCard label={t('Time')} value={(result.elapsed / 1000).toFixed(1)} unit="s" sub={`${snippet.length} ${t('chars typed')}`} info="첫 키 입력부터 마지막 글자 완성까지의 총 경과 시간입니다." />
        </div>

        {/* WPM graph */}
        <WpmGraph result={result} snippet={snippet} />

        {/* Bottom actions + scroll hint */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8 }}>
          <button className="dt-btn dt-btn-secondary" onClick={() => navigate(-1)}>✕ {t('Exit')}</button>
          <button onClick={() => goToSection(1)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--dt-text-3)', padding: '6px 20px', transition: 'color 140ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--dt-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--dt-text-3)')}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{t('Replay & Analysis')}</span>
            <IconArrowDown size={18} />
          </button>
          <div style={{ width: 80 }} />
        </div>
      </div>

      {/* ── Section 1: Replay + Analysis ── */}
      <div ref={section1Ref} style={{ ...sectionStyle, scrollSnapAlign: 'start', paddingTop: 28, paddingBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div className="dt-label" style={{ marginBottom: 2 }}>Analysis</div>
            <div className="dt-h2 m-0" style={{ fontSize: 22 }}>{t('Replay & Breakdown')}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => goToSection(0)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--dt-text-3)', fontSize: 13 }}>
              <IconArrowUp size={14} /> {t('Back to stats')}
            </button>
            {apiSnippetId && (
              <button onClick={() => goToSection(2)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--dt-text-3)', fontSize: 13 }}>
                {t('Ranking')} <IconArrowDown size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Replay (TypoHeatmap) */}
        <div className="dt-card p-0 overflow-hidden" style={{ flex: '0 0 auto' }}>
          <div className="py-[14px] px-5 border-b-[0.5px] border-dt-border">
            <span className="dt-h3 m-0">{t('Replay')}</span>
          </div>
          <div className="p-5" style={{ maxHeight: 260, overflowY: 'auto' }}>
            <TypoHeatmap content={snippet} typos={result.typos} replayData={result.replayData} />
          </div>
        </div>

        {/* Mistyped + Word breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}><MistypedLetters result={result} snippet={snippet} /></div>
          <div style={{ overflow: 'hidden' }}><WordChips result={result} snippet={snippet} /></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <button className="dt-btn dt-btn-secondary" onClick={() => navigate(-1)}>✕ {t('Exit')}</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
            <button className="dt-btn dt-btn-primary" onClick={onNext}><IconArrowRight size={16} /> {t('Try another snippet')}</button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Ranking ── */}
      {apiSnippetId && (
        <div ref={section2Ref} style={{ ...sectionStyle, scrollSnapAlign: 'start', paddingTop: 28, paddingBottom: 16, overflowY: 'auto' }}>
          <SnippetRankingSection snippetId={apiSnippetId} myCore={core} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 'auto', paddingTop: 20 }}>
            <button className="dt-btn dt-btn-secondary" onClick={() => navigate(-1)}>✕ {t('Exit')}</button>
            <button onClick={() => goToSection(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--dt-text-3)', padding: '8px 16px' }}>
              <IconArrowUp size={16} /> {t('Back to stats')}
            </button>
            <button className="dt-btn dt-btn-secondary" onClick={onChangeSettings}>{t('Change settings')}</button>
            <button className="dt-btn dt-btn-primary dt-btn-lg" onClick={onNext}>
              <IconArrowRight size={16} /> {t('Try another snippet')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Solo = () => {
  const [searchParams] = useSearchParams();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [lang, setLang] = useState('javascript');
  const [phase, setPhase] = useState<Phase>('setup');
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState<TypingProgress>({ index: 0, wpm: 0, acc: 100, elapsed: 0, total: 1, errors: 0, finished: false });
  const [result, setResult] = useState<TypingResult | null>(null);
  const [track, setTrack] = useState<SoloTrack | null>(null);
  const [apiSnippetId, setApiSnippetId] = useState<number | undefined>(undefined);
  const [loadingSnippet, setLoadingSnippet] = useState(false);
  const [savedCoreInfo, setSavedCoreInfo] = useState<{ core: number; isNewBest: boolean; prevBestCore: number } | null>(null);

  // Load snippet from URL param on mount
  useEffect(() => {
    const idParam = searchParams.get('snippetId');
    if (!idParam) return;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return;

    setLoadingSnippet(true);
    getPublicSnippet(id)
      .then(snippet => {
        const langKey = toLangKey(snippet.language);
        const soloTrack: SoloTrack = {
          id: String(snippet.id),
          lang: langKey,
          difficulty: snippet.difficulty.toLowerCase() as SoloTrack['difficulty'],
          title: snippet.title,
          avgWpm: snippet.avgWpm,
          code: snippet.content,
        };
        setTrack(soloTrack);
        setApiSnippetId(snippet.id);
        setLang(langKey);
        setResult(null);
        setResetKey(k => k + 1);
        setPhase('typing');
      })
      .catch(() => {
        // fall back to setup
        setPhase('setup');
      })
      .finally(() => setLoadingSnippet(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snippet = track ? track.code : '';
  const diff = track ? track.difficulty : 'medium';
  const realLang = track ? track.lang : lang;

  const fetchAndStart = async (l: string) => {
    setLoadingSnippet(true);
    try {
      const apiLang = UI_TO_API_LANG[l];
      const s = await getRandomSnippet(apiLang);
      const langKey = toLangKey(s.language);
      const soloTrack: SoloTrack = {
        id: String(s.id),
        lang: langKey,
        difficulty: s.difficulty.toLowerCase() as SoloTrack['difficulty'],
        title: s.title,
        avgWpm: Number(s.avgWpm),
        code: s.content,
      };
      setApiSnippetId(s.id);
      setTrack(soloTrack);
      setResult(null);
      setResetKey((k) => k + 1);
      setPhase('typing');
    } catch {
      // API 실패 시 setup 유지 — 오류는 버튼 상태로 표시 안 함
    } finally {
      setLoadingSnippet(false);
    }
  };
  const start = () => fetchAndStart(lang);

  const onFinish = async (r: TypingResult) => {
    setResult(r);
    setPhase('result');
    setSavedCoreInfo(null);

    if (isLoggedIn && apiSnippetId) {
      try {
        const saved = await saveSnippetResult({
          snippetId: apiSnippetId,
          wpm: Math.max(0.1, r.wpm),
          rawWpm: Math.max(0.1, r.rawWpm),
          accuracy: Math.min(100, Math.max(0, r.acc)),
          durationSec: Math.min(3600, Math.max(1, Math.round(r.elapsed / 1000))),
          typos: r.typos ?? [],
          replayData: r.replayData ?? [],
        });
        if (saved) {
          setSavedCoreInfo({ core: saved.core, isNewBest: saved.isNewBest, prevBestCore: saved.prevBestCore });
        }
      } catch (err) {
        console.error('[Solo] saveSnippetResult failed:', err);
      }
    }
  };

  const next = () => fetchAndStart(lang);

  if (loadingSnippet) {
    return (
      <div className="dt-page-narrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="dt-caption" style={{ fontSize: 15 }}>Loading snippet…</div>
      </div>
    );
  }

  if (phase === 'typing' && track) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '40px 72px' }}>
        <SoloTyping
          snippet={snippet} lang={lang} diff={diff} progress={progress} setProgress={setProgress}
          onFinish={onFinish} resetKey={resetKey}
          onReset={() => setResetKey((k) => k + 1)}
          onChangeSettings={() => { setApiSnippetId(undefined); setPhase('setup'); }}
          realLang={realLang}
        />
      </div>
    );
  }

  return (
    <div className="dt-page-narrow">
      {phase === 'setup' && (
        <SoloSetup lang={lang} setLang={setLang} onStart={start} />
      )}
      {phase === 'result' && result && (
        <SoloResult
          result={result} track={track} diff={diff}
          onNext={next}
          onChangeSettings={() => { setApiSnippetId(undefined); setPhase('setup'); }}
          snippet={snippet}
          apiSnippetId={apiSnippetId}
          savedCoreInfo={savedCoreInfo}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
};

export default Solo;
