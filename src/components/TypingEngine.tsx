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
}: Props) => {
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finishedFlag, setFinishedFlag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const typosRef = useRef<TypoData[]>([]);
  const replayDataRef = useRef<ReplayEvent[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const currentComboRef = useRef(0);
  const longestComboRef = useRef(0);

  useEffect(() => {
    setTyped(''); setErrors(0); setStartedAt(null); setFinishedFlag(false);
    finishedRef.current = false;
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

    if (e.key === 'Backspace') { setTyped((t) => t.slice(0, -1)); return; }

    let inChar = e.key;
    if (e.key === 'Enter') inChar = '\n';
    if (e.key === 'Tab') inChar = '\t';

    setTyped((t) => {
      if (t.length >= code.length) return t;
      const expected = code[t.length];
      const isCorrect = inChar === expected;
      const timestamp = startedAtRef.current ? now - startedAtRef.current : 0;

      replayDataRef.current.push({ index: t.length, char: inChar, timestamp, correct: isCorrect });

      if (isCorrect) {
        currentComboRef.current += 1;
        if (currentComboRef.current > longestComboRef.current) {
          longestComboRef.current = currentComboRef.current;
        }
      } else {
        currentComboRef.current = 0;
        queueMicrotask(() => setErrors((x) => x + 1));
        typosRef.current.push({ index: t.length, expected, typed: inChar });
      }

      return t + inChar;
    });
  }, [active, code]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey, active]);

  useEffect(() => { if (autoFocus && containerRef.current) containerRef.current.focus(); }, [autoFocus, resetKey]);

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
      const finalElapsed = finalNow - startedAt;
      let finalCorrect = 0;
      for (let i = 0; i < typed.length; i++) if (typed[i] === code[i]) finalCorrect++;
      const finalTotalKeys = finalCorrect + errors;
      const finalAcc = finalTotalKeys > 0 ? (finalCorrect / finalTotalKeys) * 100 : 100;
      const finalWpm = Math.round((finalCorrect / 5) / (finalElapsed / 60000));
      const rawWpm = Math.round((replayDataRef.current.length / 5) / (finalElapsed / 60000));

      onFinish?.({
        wpm: finalWpm,
        rawWpm,
        acc: finalAcc,
        elapsed: finalElapsed,
        errors,
        longestCombo: longestComboRef.current,
        typos: [...typosRef.current],
        replayData: [...replayDataRef.current],
      });
    }
  }, [typed, code, startedAt, errors]);

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

  return (
    <div ref={containerRef} tabIndex={0} style={{ outline: 'none', position: 'relative' }}>
      {showCounter && (
        <div style={{ display: 'flex', gap: 24, marginBottom: 14, alignItems: 'baseline', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-2)', fontSize: 13 }}>
          <span><span style={{ color: 'var(--dt-primary)', fontSize: 24, fontWeight: 500 }} className="dt-tabular">{wpm}</span> <span style={{ opacity: .7 }}>wpm</span></span>
          <span><span style={{ color: 'var(--dt-text)', fontSize: 16 }} className="dt-tabular">{acc.toFixed(1)}</span><span style={{ opacity: .7 }}>% acc</span></span>
          <span><span style={{ color: 'var(--dt-text)', fontSize: 16 }} className="dt-tabular">{(elapsedMs / 1000).toFixed(1)}</span><span style={{ opacity: .7 }}>s</span></span>
          <span style={{ marginLeft: 'auto' }}>{typed.length} / {code.length}</span>
        </div>
      )}
      <div className="dt-code-area" style={{ fontSize, lineHeight: 1.85 }}>
        {cells.map(({ i, ch, state, isCursor }) => {
          const isNewline = ch === '\n';
          const cls = ['ch', state !== 'pending' ? state : '', isCursor && active ? 'cursor' : '', caretStyle === 'block' ? 'caret-block' : '', caretStyle === 'under' ? 'caret-under' : ''].filter(Boolean).join(' ');
          if (isNewline) {
            return (
              <span key={i}>
                <span className={cls}>{state === 'error' ? '↵' : ' '}</span>
                {'\n'}
              </span>
            );
          }
          return <span key={i} className={cls}>{ch}</span>;
        })}
        {typed.length === code.length && !finishedFlag && (
          <span className={`ch cursor${caretStyle === 'block' ? ' caret-block' : ''}${caretStyle === 'under' ? ' caret-under' : ''}`}>&nbsp;</span>
        )}
      </div>
    </div>
  );
};

export default TypingEngine;
