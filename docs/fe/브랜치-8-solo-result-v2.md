# Branch 8 — feat/fe-solo-result-v2

## 목적
Solo 완료 화면 전면 개선

## 변경 내역

### 1. WPM 그래프 디테일 개선
- y축 grid lines + 레이블 (5단계)
- 적절한 padding 좌표 계산
- replayData 기반 실제 WPM 샘플 사용 (없으면 기존 의사랜덤)

### 2. 리플레이
- replayData 이벤트 기반 타이핑 재생
- 재생/일시정지/처음으로 컨트롤
- 속도 배율 선택 (0.5x / 1x / 2x)
- 정타/오타 색상 강조

### 3. 스크롤 스냅
- scroll-snap-type: y mandatory
- 섹션별 scroll-snap-align: start
- 1틱 스크롤로 다음/이전 섹션 이동

### 4. 나가기 버튼
- 좌상단 고정 X 버튼 → navigate(-1) 또는 /snippets

## 수정 파일
- `src/pages/Solo.tsx`
