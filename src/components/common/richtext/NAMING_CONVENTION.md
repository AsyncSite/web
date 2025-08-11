# RichTextEditor 네이밍 컨벤션

## 목적
다른 RichTextEditor 컴포넌트와의 CSS 충돌을 완전히 방지하기 위한 고유 네이밍 시스템

## 접두사
`sdpre__` (Study Detail Page Rich Editor)

## 클래스명 규칙

### 컨테이너
- `sdpre__container` - 최상위 컨테이너
- `sdpre__editor-wrapper` - 에디터 래퍼
- `sdpre__content-area` - 콘텐츠 영역

### 툴바
- `sdpre__toolbar` - 툴바 컨테이너
- `sdpre__toolbar-button` - 툴바 버튼
- `sdpre__toolbar-button--active` - 활성화된 버튼 (BEM modifier)
- `sdpre__toolbar-icon` - 버튼 아이콘
- `sdpre__toolbar-separator` - 구분선

### 에디터
- `sdpre__tiptap-wrapper` - TipTap 에디터 래퍼
- `sdpre__preview` - 미리보기 모드
- `sdpre__char-count` - 글자 수 표시

### 색상 선택기
- `sdpre__color-picker` - 색상 선택기 컨테이너
- `sdpre__color-picker-header` - 헤더
- `sdpre__color-picker-close` - 닫기 버튼
- `sdpre__color-presets` - 색상 프리셋 그룹
- `sdpre__color-preset` - 개별 색상 버튼
- `sdpre__color-reset` - 색상 초기화

### 라벨
- `sdpre__label` - 필드 라벨

## Data 속성
TipTap이 자동 생성하는 요소들을 스코핑하기 위해 사용:
```html
<div data-sdpre-scope="study-detail">
  <!-- TipTap이 생성하는 .ProseMirror 등이 여기 들어감 -->
</div>
```

## CSS 선택자 예시
```css
/* 우리가 제어하는 요소 */
.sdpre__toolbar { }
.sdpre__toolbar-button { }
.sdpre__toolbar-button--active { }

/* TipTap이 생성하는 요소 - data 속성으로 스코핑 */
[data-sdpre-scope="study-detail"] .ProseMirror { }
[data-sdpre-scope="study-detail"] .ProseMirror strong { }
[data-sdpre-scope="study-detail"] .ProseMirror mark { }
```

## 상태 표현 (BEM Modifier)
- `--active` : 활성 상태
- `--disabled` : 비활성 상태
- `--preview` : 미리보기 모드
- `--editing` : 편집 모드

## 체크리스트
- [ ] 모든 className을 sdpre__ 접두사로 변경
- [ ] data-sdpre-scope 속성 추가
- [ ] CSS 파일의 모든 선택자 업데이트
- [ ] 기존 충돌 가능한 클래스명 제거
- [ ] import 순서 확인