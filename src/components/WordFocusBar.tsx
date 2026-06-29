import { getWordContext } from '@/components/SoloRaceBar';

interface WordFocusBarProps {
  snippet: string;
  typedIndex: number;
}

const WordFocusBar = ({ snippet, typedIndex }: WordFocusBarProps) => {
  const { curr, typedInCurr, curIdx } = getWordContext(snippet, typedIndex);
  const typedWord = curr?.text.slice(0, typedInCurr) ?? '';
  return (
    <>
      <style>{`@keyframes wfb-pop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 46, marginTop: 8, flexShrink: 0,
        userSelect: 'none', width: '100%',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 160, padding: '0 22px', height: 46,
          background: 'var(--dt-type-bg)', borderRadius: 24,
          boxShadow: 'inset 0 0 0 1.5px rgba(120,150,255,0.22), 0 0 24px -6px color-mix(in oklab, var(--dt-primary) 25%, transparent)',
        }}>
          <span key={curIdx} style={{
            fontFamily: 'var(--dt-font-mono)', fontSize: 18, fontWeight: 500,
            color: 'var(--dt-primary)', letterSpacing: '0.06em',
            animation: 'wfb-pop 120ms ease-out',
          }}>
            {typedWord || <span style={{ opacity: 0.2, color: 'var(--dt-text-3)' }}>{'|'}</span>}
          </span>
          <span className="animate-pulse" style={{
            display: 'inline-block', width: 2, height: '1em',
            background: 'var(--dt-primary)', verticalAlign: 'text-bottom', marginLeft: 2,
          }} />
        </div>
      </div>
    </>
  );
};

export default WordFocusBar;
