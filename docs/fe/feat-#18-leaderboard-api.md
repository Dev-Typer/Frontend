# feat/#18 — 리더보드 API 연동 및 더미 데이터 전면 제거

## 목적 및 배경

백엔드 PR #58이 머지되면 `GET /api/leaderboard/solo`, `GET /api/leaderboard/streak`, `GET /api/snippets/:id/ranking` 세 엔드포인트가 활성화된다. 현재 프론트엔드는 Ranking 페이지와 HomeContemporary의 ArenaLeaderboard가 모두 `GLOBAL_RANKING` 더미 데이터에 의존한다. 이를 실제 API로 교체하고 더미 의존을 완전히 제거한다.

---

## 화면 구성 / 컴포넌트 설계

### Ranking.tsx 탭별 연동

| 탭 | 엔드포인트 | 변경 내용 |
|----|-----------|---------|
| Overall | `GET /api/leaderboard/solo` | 더미 제거, 실제 totalCore/avgWpm/playCount/snippetCount/avgAccuracy 표시 |
| By language | `GET /api/leaderboard/solo?language=xxx` | 언어 변경 시 API 재호출 |
| Streak | `GET /api/leaderboard/streak` | currentStreak 컬럼만 표시 (Best 컬럼 제거 — 스펙상 없음) |
| Today's challenge | 기존 유지 (dailyChallenge 별도 scope) |

- 페이지네이션: 1페이지 size=50 고정 (무한스크롤 미구현)
- 로그인 시 `isMe: true` 행 하이라이트
- 로딩 스켈레톤: `loading` 상태에서 `dt-caption` placeholder

### HomeContemporary.tsx — ArenaLeaderboard

- `focus === 'solo'` 일 때 `GET /api/leaderboard/solo?size=6&page=1` 호출 → top 6을 totalCore 기준으로 표시
- `focus === 'battle'` 은 더미 유지 (배틀 미구현)
- GLOBAL_RANKING import 제거

### SnippetRankingPage.tsx

| 기존 컬럼 | 추가 컬럼 |
|----------|---------|
| 순위, 유저, WPM, 정확도, 기록일, 리플레이 | **CORE**, **rawWPM**, **소요시간** |

- `profileUrl` 있으면 Avatar에 src 연결
- 페이지네이션 (page state, size=20)

### Snippets.tsx

- 스니펫 카드 하단에 "랭킹 보러가기" 버튼 추가
- `onClick` → `navigate(\`/ranking/snippets/${snippet.id}\`)`

---

## 연동 API 목록

```
GET /api/leaderboard/solo?page=1&size=50&language={lang}
GET /api/leaderboard/streak?page=1&size=50
GET /api/snippets/:id/ranking?page=1&size=20
```

응답 공통 래퍼: `{ success, statusCode, data, timestamp }`

### SoloLeaderboardEntry (응답 필드)
```ts
rank, userId, username, profileUrl, totalCore, avgWpm, playCount, snippetCount, avgAccuracy, isMe
```
### SoloLeaderboardResponse
```ts
entries: SoloLeaderboardEntry[], myRank: number | null, totalCount, page, size
```

### StreakLeaderboardEntry
```ts
rank, userId, username, profileUrl, currentStreak, isMe
```

### SnippetRankingItem (응답 필드 — 기존 + 신규)
```ts
rank, userId, username, profileUrl, core, wpm, rawWpm, accuracy, durationSec, createdAt
```

---

## task 단위 커밋 계획

1. `feat(api): leaderboardApi.ts 신규 생성 — Solo/Streak 타입 및 API 함수`
2. `feat(api): snippetResultApi RankingItem 타입 확장 — rawWpm/durationSec/profileUrl/pagination`
3. `feat(ranking): Ranking.tsx Overall/Language 탭 API 연동, 더미 제거`
4. `feat(ranking): Ranking.tsx Streak 탭 API 연동, Best 컬럼 제거`
5. `feat(home): ArenaLeaderboard Solo API 연동, GLOBAL_RANKING import 제거`
6. `feat(snippet-ranking): SnippetRankingPage Core/rawWpm/durationSec 컬럼 추가, 페이지네이션`
7. `feat(snippets): 스니펫 카드 "랭킹 보러가기" 버튼 추가`
