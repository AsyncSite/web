# 캘린더 오버플로우 이슈

## 문제 설명
스터디 캘린더에서 많은 스터디가 표시될 때 캘린더가 컨테이너 경계를 살짝 넘어가는 현상 발생

## 현재 상태
- 대부분의 오버플로우 문제는 해결됨
- 아주 미세하게 오른쪽으로 삐져나오는 현상 잔존

## 적용된 해결책
1. **컨테이너 레벨**
   - `overflow-x: hidden` 적용
   - `box-sizing: border-box` 전체 적용
   - 최대 너비 제한 설정

2. **그리드 최적화**
   - `grid-template-columns: repeat(7, minmax(0, 1fr))` 사용
   - 패딩 및 간격 축소
   - 이벤트 크기 최소화

3. **이벤트 표시**
   - 3개 이상의 이벤트는 "+N개 더보기" 모달로 처리
   - 스터디 이름 8자 제한 및 말줄임표 처리
   - 폰트 크기 축소 (0.65rem)

## 추가 개선 방안
1. **반응형 처리 강화**
   - 작은 화면에서 캘린더 레이아웃 조정
   - 모바일에서는 리스트 뷰로 자동 전환

2. **동적 크기 조정**
   - 스터디 수에 따라 셀 크기 자동 조정
   - 컨테이너 너비에 따른 적응형 레이아웃

3. **성능 최적화**
   - 가상 스크롤링 도입 검토
   - 뷰포트 밖 이벤트 렌더링 최적화

## 관련 파일
- `/src/components/study/StudyCalendar/StudyCalendar.tsx`
- `/src/components/study/StudyCalendar/StudyCalendar.module.css`
- `/src/utils/studyScheduleUtils.ts`

## 참고사항
- 현재 미세한 오버플로우는 사용성에 큰 영향 없음
- 추후 전체적인 UI 개선 시 함께 처리 예정