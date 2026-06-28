import TypingEngine from './TypingEngine';
import type { TypingProgress, TypingResult } from '@/types';

interface Props {
  code: string;
  resetKey?: number | string;
  caretStyle?: 'line' | 'under' | 'block';
  fontSize?: number;
  onProgress?: (p: TypingProgress) => void;
  onFinish?: (r: TypingResult) => void;
  active?: boolean;
  fileName?: string;
  index?: number;
  total?: number;
  fill?: boolean;
  /** 고정 높이(px). 설정 시 fill 무시, 내부 스크롤바 숨김 */
  height?: number;
}

// Solo / Battle / Daily가 공유하는 mac 스타일 에디터 chrome — 트래픽 라이트 + 파일명 + 카운터
const PlayEditor = ({
  code, resetKey, caretStyle = 'line', fontSize = 20,
  onProgress, onFinish, active = true,
  fileName = 'snippet.txt', index = 0, total = 0,
  fill = false, height,
}: Props) => (
  <div
    className="flex flex-col rounded-dt-md overflow-hidden bg-dt-type-bg shadow-[inset_0_0_0_1px_rgba(120,150,255,0.18),0_24px_64px_-30px_rgba(0,0,0,0.8)]"
    style={height ? { height, flexShrink: 0 } : fill ? { flex: '1 1 0', minHeight: 0 } : undefined}
  >
    <div className="flex items-center gap-2 py-3 px-[18px] shadow-[inset_0_-1px_0_rgba(120,150,255,0.14)] shrink-0">
      <span className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
      <span className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E]" />
      <span className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
      <span className="ml-2 text-[12.5px] text-[#7A8195] font-dt-mono">{fileName}</span>
      <span className="ml-auto text-[11.5px] text-[#56657F] font-dt-mono">{index} / {total}</span>
    </div>
    {/* height 고정 시 스크롤바 숨김, 커서 scrollIntoView로 자동 이동 */}
    <div
      className="flex-1 min-h-0 overflow-auto py-2"
      style={height ? { scrollbarWidth: 'none' } : undefined}
    >
      <TypingEngine
        code={code} resetKey={resetKey}
        caretStyle={caretStyle} fontSize={fontSize}
        active={active}
        onProgress={onProgress} onFinish={onFinish}
        embedded
      />
    </div>
  </div>
);

export default PlayEditor;
