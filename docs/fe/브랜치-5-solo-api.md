# Branch 5 — feat/fe-solo-api

## 목적
Solo 플레이의 두 가지 API 연결 누락 수정.

1. **스니펫 로딩**: `SOLO_TRACKS` 목 데이터 → `GET /api/snippets/random` API
2. **결과 제출**: 타이핑 완료 후 `POST /api/snippet-results` 미호출 → 호출로 수정

## 변경 파일
- `src/pages/Solo.tsx`

## 백엔드 엔드포인트
| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/snippets/random` | 불필요 | 언어/난이도 필터로 랜덤 스니펫 반환 |
| POST | `/api/snippet-results` | Optional JWT | 결과 저장 (비로그인 시 스킵 후 200) |

## 타입 매핑

### 언어 (UI lowercase → API TitleCase)
```
javascript → JavaScript  typescript → TypeScript  python → Python
go → Go  java → Java  kotlin → Kotlin
c++ → C++  c# → C#  c → C  rust → Rust
```

### 난이도 (API UPPERCASE → UI lowercase, CORE 계산용)
```
EASY → easy  MEDIUM → medium  HARD → hard
```

### API Snippet → SoloTrack 매핑
```typescript
{
  id: String(snippet.id),       // 로컬 best 저장용 (string)
  lang: snippet.language.toLowerCase(),
  difficulty: snippet.difficulty.toLowerCase() as Difficulty,
  title: snippet.title,
  avgWpm: snippet.avgWpm,
  code: snippet.content,
}
// snippetNumId: number — 결과 제출용 별도 보관
```

### SaveResultBody 매핑
```typescript
{
  snippetId: snippetNumId,
  wpm: result.wpm,
  rawWpm: result.rawWpm,
  accuracy: result.acc,
  durationSec: Math.max(3, Math.round(result.elapsed / 1000)),
  typos: result.typos,
  replayData: result.replayData,
}
```

## 구현 포인트
- `startWith(lang)` async화: 스니펫 로딩 중 로딩 스피너 표시
- API 오류 시 에러 메시지 표시 (fallback 없음 — 목 데이터 섞으면 실 데이터와 혼재됨)
- `saveSnippetResult` 실패는 조용히 무시 (비로그인 포함, 결과 화면 표시는 항상 진행)
- `snippetNumId` state: `number | null` — 로딩 중 또는 실패 시 null
