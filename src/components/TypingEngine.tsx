import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { TypingProgress, TypingResult, TypoData, ReplayEvent } from '@/types';

interface Props {
  code: string;
  onProgress?: (p: TypingProgress) => void;
  onFinish?: (r: TypingResult) => void;
  active?: boolean;
  caretStyle?: 'line' | 'under' | 'block';
  fontSize?: number;
  autoFocus?: boolean;
  showCounter?: boolean;
  resetKey?: number | string;
  embedded?: boolean;
}

const TypingEngine = ({
  code,
  onProgress,
  onFinish,
  active = true,
  caretStyle = 'line',
  fontSize = 18,
  autoFocus = true,
  showCounter = false,
  resetKey,
  embedded = false,
}: Props) => {
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finishedFlag, setFinishedFlag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const finishedRef  = useRef(false);
  const typedRef     = useRef('');          // side effect용 현재 typed 추적 (Strict Mode 이중 실행 방지)
  const errorsRef    = useRef(0);
  const typosRef     = useRef<TypoData[]>([]);
  const replayDataRef = useRef<ReplayEvent[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const currentComboRef = useRef(0);
  const longestComboRef = useRef(0);
  const cursorSpanRef   = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setTyped(''); setErrors(0); setStartedAt(null); setFinishedFlag(false);
    finishedRef.current = false;
    typedRef.current = '';
    errorsRef.current = 0;
    typosRef.current = [];
    replayDataRef.current = [];
    startedAtRef.current = null;
    currentComboRef.current = 0;
    longestComboRef.current = 0;
  }, [resetKey, code]);

  useEffect(() => {
    if (!startedAt || finishedFlag) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finishedFlag]);

  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const correctCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === code[i]) c++;
    return c;
  }, [typed, code]);
  const wpm = elapsedMs > 500 ? Math.round((correctCount / 5) / (elapsedMs / 60000)) : 0;
  const totalKeystrokes = correctCount + errors;
  const acc = totalKeystrokes > 0 ? Math.max(0, (correctCount / totalKeystrokes) * 100) : 100;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!active || finishedRef.current) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter' && e.key !== 'Tab') return;
    e.preventDefault();

    const now = Date.now();
    if (!startedAtRef.current) {
      startedAtRef.current = now;
      setStartedAt(now);
    }

    if (e.key === 'Backspace') {
      typedRef.current = typedRef.current.slice(0, -1);
      setTyped(typedRef.current);
      return;
    }

    let inChar = e.key;
    if (e.key === 'Enter') inChar = '\n';
    if (e.key === 'Tab')   inChar = '\t';

    // 범위 초과 방지
    if (typedRef.current.length >= code.length) return;

    const idx = typedRef.current.length;
    const expected = code[idx];
    const isCorrect = inChar === expected;
    const timestamp = startedAtRef.current ? now - startedAtRef.current : 0;

    // --- side effect: ref에만 기록 (setTyped 밖에서 실행 → Strict Mode 이중 호출 없음) ---
    replayDataRef.current.push({ index: idx, char: inChar, timestamp, correct: isCorrect });

    if (isCorrect) {
      currentComboRef.current += 1;
      if (currentComboRef.current > longestComboRef.current) {
        longestComboRef.current = currentComboRef.current;
      }
    } else {
      currentComboRef.current = 0;
      typosRef.current.push({ index: idx, expected, typed: inChar });
      errorsRef.current += 1;
      setErrors(errorsRef.current);
    }

    typedRef.current = typedRef.current + inChar;

    // 엔터 후 다음 줄 앞 공백(들여쓰기) 자동 스킵
    if (isCorrect && inChar === '\n') {
      let nextIdx = typedRef.current.length;
      while (nextIdx < code.length && (code[nextIdx] === ' ' || code[nextIdx] === '\t')) {
        replayDataRef.current.push({ index: nextIdx, char: code[nextIdx], timestamp, correct: true });
        typedRef.current += code[nextIdx];
        nextIdx++;
      }
    }

    setTyped(typedRef.current);
  }, [active, code]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey, active]);

  useEffect(() => { if (autoFocus && containerRef.current) containerRef.current.focus(); }, [autoFocus, resetKey]);

  // 커서 위치를 부모 스크롤 컨테이너에 노출 (overflow-auto 인 PlayEditor inner div가 스크롤)
  useEffect(() => {
    cursorSpanRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [typed.length]);

  useEffect(() => {
    onProgress?.({
      index: typed.length, total: code.length,
      wpm, acc, elapsed: elapsedMs, errors, finished: finishedFlag,
    });
  }, [typed, wpm, acc, elapsedMs, finishedFlag]);

  useEffect(() => {
    if (!finishedRef.current && typed.length === code.length && startedAt) {
      finishedRef.current = true;
      setFinishedFlag(true);
      const finalNow = Date.now();
      setNow(finalNow);
      const finalElapsed = Math.max(1, finalNow - startedAt);
      let finalCorrect = 0;
      for (let i = 0; i < typed.length; i++) if (typed[i] === code[i]) finalCorrect++;
      const finalTotalKeys = finalCorrect + errorsRef.current;
      const finalAcc = finalTotalKeys > 0 ? (finalCorrect / finalTotalKeys) * 100 : 100;
      const finalWpm = Math.round((finalCorrect / 5) / (finalElapsed / 60000));
      const rawWpm = Math.round((replayDataRef.current.length / 5) / (finalElapsed / 60000));

      onFinish?.({
        wpm: finalWpm,
        rawWpm,
        acc: finalAcc,
        elapsed: finalElapsed,
        errors: errorsRef.current,
        longestCombo: longestComboRef.current,
        typos: [...typosRef.current],
        replayData: [...replayDataRef.current],
      });
    }
  }, [typed, code, startedAt]);

  const cells = useMemo(() => {
    const out = [];
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      let state = 'pending';
      if (i < typed.length) state = typed[i] === ch ? 'correct' : 'error';
      const isCursor = i === typed.length;
      out.push({ i, ch, state, isCursor });
    }
    return out;
  }, [code, typed]);

  // 현재 커서 위치 기반 상태바 정보
  const statusInfo = useMemo(() => {
    const curIdx = Math.min(typed.length, code.length - 1);
    const before = code.slice(0, curIdx);
    const linesBefore = before.split('\n');
    const lineNum = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;
    const allLines = code.split('\n');
    const currentLineText = allLines[lineNum - 1] ?? '';
    const colInLine = col - 1; // 0-based index in line

    const nextChar = code[typed.length];
    const charLabel =
      nextChar === '\n' ? '↵ Enter'
      : nextChar === '\t' ? '⇥ Tab'
      : nextChar === ' ' ? '␣ Space'
      : nextChar != null ? nextChar
      : '';

    return { lineNum, col, colInLine, currentLineText, charLabel, totalLines: allLines.length };
  }, [typed, code]);

  return (
    <div ref={containerRef} tabIndex={0} className={`outline-none relative ${embedded ? 'h-full' : ''}`}>
      {showCounter && (
        <div className="flex gap-6 mb-3.5 items-baseline font-dt-mono text-dt-text-2 text-[13px]">
          <span><span className="text-dt-primary text-2xl font-medium dt-tabular">{wpm}</span> <span className="opacity-70">wpm</span></span>
          <span><span className="text-dt-text text-base dt-tabular">{acc.toFixed(1)}</span><span className="opacity-70">% acc</span></span>
          <span><span className="text-dt-text text-base dt-tabular">{(elapsedMs / 1000).toFixed(1)}</span><span className="opacity-70">s</span></span>
          <span className="ml-auto">{typed.length} / {code.length}</span>
        </div>
      )}
      <div
        className={`dt-code-area leading-[1.85] ${embedded ? '!bg-transparent !border-0 !rounded-none px-7 py-3 !overflow-x-visible' : ''}`}
        style={{ fontSize }}
      >
        {cells.map(({ i, ch, state, isCursor }) => {
          const isNewline = ch === '\n';
          const cls = ['ch', state !== 'pending' ? state : '', isCursor && active ? 'cursor' : '', caretStyle === 'block' ? 'caret-block' : '', caretStyle === 'under' ? 'caret-under' : ''].filter(Boolean).join(' ');
          if (isNewline) {
            return (
              <span key={i}>
                <span ref={isCursor ? cursorSpanRef : null} className={cls}>{state === 'error' ? '↵' : ' '}</span>
                {'\n'}
              </span>
            );
          }
          return <span ref={isCursor ? cursorSpanRef : null} key={i} className={cls}>{ch}</span>;
        })}
        {typed.length === code.length && !finishedFlag && (
          <span className={`ch cursor${caretStyle === 'block' ? ' caret-block' : ''}${caretStyle === 'under' ? ' caret-under' : ''}`}>&nbsp;</span>
        )}
      </div>

      {/* 하단 상태바 — Ln/Col + 진행도 */}
      {active && !finishedFlag && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16,
          marginTop: 6, padding: '4px 4px 2px',
          fontFamily: 'var(--dt-font-mono)', fontSize: 11,
          color: 'var(--dt-text-3)',
          borderTop: '0.5px solid var(--dt-border)',
          userSelect: 'none',
        }}>
          <span style={{ opacity: 0.5 }}>
            Ln {statusInfo.lineNum} / {statusInfo.totalLines} &nbsp; {typed.length} / {code.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default TypingEngine;
