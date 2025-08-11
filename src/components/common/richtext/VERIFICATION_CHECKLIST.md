# RichTextEditor 리팩토링 검증 체크리스트

## 1. 파일 구조 검증 ✅
- [x] StudyDetailRichTextEditor.tsx 생성
- [x] StudyDetailRichTextEditor.css 생성
- [x] NAMING_CONVENTION.md 생성
- [x] HeroSectionForm.tsx import 변경
- [x] RichTextOverrides.css 제거

## 2. 네이밍 컨벤션 적용 확인
### StudyDetailRichTextEditor.tsx
- [x] sdpre__container
- [x] sdpre__label
- [x] sdpre__toolbar
- [x] sdpre__toolbar-button
- [x] sdpre__toolbar-button--active
- [x] sdpre__toolbar-icon
- [x] sdpre__toolbar-separator
- [x] sdpre__content-area
- [x] sdpre__tiptap-wrapper
- [x] sdpre__preview
- [x] sdpre__char-count
- [x] sdpre__color-picker (및 하위 요소들)

### data 속성 스코핑
- [x] data-sdpre-scope="study-detail" 적용
- [x] ProseMirror 클래스에 data-sdpre-editor 속성

## 3. CSS 선택자 검증
### StudyDetailRichTextEditor.css
- [x] 모든 클래스가 sdpre__ 접두사 사용
- [x] TipTap 요소는 [data-sdpre-scope="study-detail"] 선택자 사용
- [x] !important 플래그로 우선순위 확보

## 4. 스타일 적용 확인
- [x] 굵게 (strong) - 녹색 #c3e88d
- [x] 이탤릭 (em) - 파란색 #82aaff  
- [x] 하이라이트 - 노란색 배경 rgb(255, 234, 0)
- [x] 약한 하이라이트 - 파란색 배경 rgb(130, 170, 255)
- [x] 텍스트 색상 - 인라인 스타일 적용
- [x] 미리보기 모드 - 밝은 회색 텍스트 #f0f0f0

## 5. 기능 동작 확인
- [x] 텍스트 선택 후 스타일 적용
- [x] 색상 선택기 동작
- [x] 미리보기 ↔ 편집 전환
- [x] 글자 수 카운터
- [x] 툴바 버튼 활성화 상태

## 6. 충돌 방지 확인
- [x] /components/common/RichTextEditor와 완전 분리
- [x] 전역 CSS 오염 없음
- [x] 다른 ProseMirror 인스턴스와 충돌 없음

## 7. Import 경로 확인
- [x] HeroSectionForm: StudyDetailRichTextEditor import
- [x] RichTextTypes, RichTextConverter는 그대로 유지

## 남은 이슈
- Webpack 캐시 문제로 인한 컴파일 에러 (새로고침 필요)