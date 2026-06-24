# Branch 6 — feat/fe-mypage-ui

## 목적
MyPage 프로필/스트릭/그래프 UI 개선 4건

## 변경 내역

### 1. 배너 — 박스 제거, 상단 전면 배경
- `ProfileHeader`를 `dt-page` 래퍼 밖으로 이동
- `rounded-dt-md overflow-hidden` 제거 → 전체 뷰포트 폭 꽉 채우는 배경
- 높이 280px → 300px, 내용물(아바타·유저명·CORE 수치)은 `max-width: 1500px` 센터 정렬 유지

### 2. 데일리 스트릭 — 좌/우 2컬럼 레이아웃
- 좌: 🔥 현재 스트릭(대형), 최장 스트릭, 제출일/전체일
- 우: 월 라벨 + contribution 그리드 + 연도 콤보박스

### 3. 스트릭 — 최근 365일 옵션
- 연도 콤보박스에 "최근 365일" 추가 → `getUserStreak(undefined, 'recent')` 호출
  - 백엔드 `type=recent` 파라미터 이미 지원됨 (최근 364일 데이터)

### 4. CORE 성장 그래프 — 색상 및 시각 개선
- 단색 버밀리언 → 값 기반 컬러 그라디언트 dot (낮음: dim, 중간: primary, 높음: cyan/lime)
- 영역 fill: primary→cyan 수직 그라디언트
- 선: 3색 선형 그라디언트(id="coreLineGrad")
- hover tooltip에 전월 대비 delta 강조 색상 추가 (증가: lime, 감소: red)

## 수정 파일
- `src/pages/MyPage.tsx`
