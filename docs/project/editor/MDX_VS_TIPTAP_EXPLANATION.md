# MDX vs TipTap - 뭐가 다른거야?

## MDX가 뭔데? 🤔

### 한 줄 설명
**MDX = Markdown + JSX (React 컴포넌트)**

마크다운 파일 안에 React 컴포넌트를 직접 쓸 수 있게 해주는 기술입니다.

### 예시로 이해하기

**일반 마크다운 (.md)**
```markdown
# 제목
**굵은 글씨**만 가능
색상? 불가능
애니메이션? 불가능
```

**MDX (.mdx)**
```mdx
# 제목
**굵은 글씨**도 되고
<ColorText color="red">빨간색</ColorText>도 되고
<AnimatedButton>애니메이션 버튼</AnimatedButton>도 됨!
```

## TipTap vs MDX - 근본적 차이

### TipTap (우리가 구현한 거)
```
[브라우저에서 편집] → [HTML 생성] → [DB 저장] → [표시]
```

**특징:**
- **WYSIWYG 에디터** (보이는 대로 편집)
- **실시간 편집** (브라우저에서)
- **HTML 출력** (`<p>안녕하세요</p>`)
- **런타임 렌더링** (사용자가 볼 때마다)

### MDX
```
[파일로 작성] → [빌드 시 컴파일] → [React 컴포넌트화] → [표시]
```

**특징:**
- **파일 기반** (.mdx 파일)
- **빌드 타임 컴파일** (배포 전에 미리)
- **React 컴포넌트 출력** (진짜 컴포넌트가 됨)
- **정적 생성** (한 번만 컴파일)

## 실제 비교 예시

### 테코테코 소개 문구를 만든다면?

#### TipTap으로 (현재 우리 방식)
```typescript
// 1. 운영진이 에디터에서 작성
<RichTextEditor 
  value={bio}
  onChange={setBio}
/>

// 2. 저장되는 내용 (HTML)
"<p>변화하는 세상에서 <strong>흔들리지 않을 나</strong>를 위한 스터디</p>"

// 3. 표시할 때
<RichTextDisplay content={bio} />
// → DOMPurify로 정화 → dangerouslySetInnerHTML로 렌더링

// 4. 커스텀 스타일? 불가능!
// 색상 바꾸려면? TipTap 익스텐션 개발해야 함
```

#### MDX로
```mdx
// 1. 개발자가 파일로 작성 (tecoteco.mdx)
import { Highlight, AnimatedHero } from '@/components'

<AnimatedHero>
  변화하는 세상에서 <Highlight gradient="purple-to-pink">흔들리지 않을 나</Highlight>를 위한 스터디
</AnimatedHero>

// 2. 빌드 시 React 컴포넌트로 변환
function TecoTecoPage() {
  return (
    <AnimatedHero>
      변화하는 세상에서 <Highlight gradient="purple-to-pink">흔들리지 않을 나</Highlight>를 위한 스터디
    </AnimatedHero>
  );
}

// 3. 무한 커스터마이징 가능!
```

## TipTap에서 마크다운?

### 가능합니다! 하지만...

```typescript
// TipTap Markdown 익스텐션
import { Markdown } from 'tiptap-markdown';

const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown,  // 마크다운 지원
  ],
});

// 마크다운 입력 → HTML 변환
"**굵게**" → "<strong>굵게</strong>"
"# 제목" → "<h1>제목</h1>"
```

**한계:**
- 여전히 HTML만 생성
- React 컴포넌트 못 씀
- 커스텀 요소 불가능

## 진짜 차이점 정리

| 구분 | TipTap | MDX |
|------|--------|-----|
| **사용자** | 운영진 (비개발자) | 개발자 |
| **편집 위치** | 브라우저 | 코드 에디터 (VSCode) |
| **편집 방식** | WYSIWYG | 코드 작성 |
| **저장 형태** | HTML (DB) | 파일 (.mdx) |
| **커스텀 컴포넌트** | ❌ 불가능 | ✅ 무제한 |
| **버전 관리** | DB 히스토리 | Git |
| **빌드 필요** | ❌ 실시간 | ✅ 빌드 필요 |
| **성능** | 보통 (런타임) | 최고 (정적) |

## 그래서 뭘 써야 해?

### TipTap이 맞는 경우 ✅
```
- 운영진이 직접 콘텐츠 작성/수정
- 실시간 편집 필요
- 개발자 개입 최소화
- 일반적인 텍스트 포맷팅만 필요
```

**우리 상황:**
- 스터디 제안 (일반 유저) → TipTap ✅
- 프로필 bio (유저) → TipTap ✅

### MDX가 맞는 경우 ✅
```
- 고정된 마케팅 페이지
- 복잡한 인터랙션/애니메이션
- 커스텀 디자인 중요
- 개발자가 관리
```

**우리 상황:**
- 테코테코 상세 페이지 → MDX ✅
- 랜딩 페이지 → MDX ✅

## 하이브리드 접근: 둘 다 쓰기!

### 실제 구현 방안

```typescript
// 1. 스터디 타입 구분
enum StudyType {
  FEATURED = 'featured',  // 주요 스터디 (MDX)
  USER_CREATED = 'user'   // 유저 제안 (TipTap)
}

// 2. 타입별 렌더링
function StudyDetailPage({ study }) {
  // MDX 스터디 (테코테코 같은)
  if (study.type === StudyType.FEATURED) {
    const MDXComponent = loadMDX(study.mdxFile);
    return <MDXComponent />;
  }
  
  // TipTap 스터디 (유저 제안)
  return (
    <div>
      <RichTextDisplay content={study.introduction} />
      <RichTextDisplay content={study.curriculum} />
    </div>
  );
}
```

### 구체적 분담

**MDX로 관리 (개발자)**
- 테코테코 (featured)
- 11루틴 (featured)
- 랜딩 페이지
- About 페이지

**TipTap으로 관리 (운영진/유저)**
- 유저 제안 스터디
- 프로필 페이지
- 공지사항
- FAQ

## 실제 MDX 셋업 (Next.js)

### 1. 설치
```bash
npm install @next/mdx @mdx-js/loader
npm install mdx-bundler  # 동적 로딩용
```

### 2. 설정
```javascript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
```

### 3. MDX 파일 작성
```mdx
// pages/study/tecoteco.mdx
import Layout from '@/components/Layout'
import { Hero, Highlight } from '@/components/study'

export default Layout

<Hero>
  # 코드로 무한동력 만드는 사람들
</Hero>

변화하는 세상에서 <Highlight color="primary">흔들리지 않을 나</Highlight>를 위한 스터디
```

### 4. 빌드 & 배포
```bash
npm run build
# MDX 파일들이 React 컴포넌트로 컴파일됨
```

## 결론

### TipTap (이미 구현한 거)
- **장점**: 운영진이 쉽게 편집
- **단점**: 커스터마이징 한계
- **용도**: 일반 콘텐츠

### MDX (추가로 도입할 수 있는 거)
- **장점**: 무한 커스터마이징
- **단점**: 개발자만 편집 가능
- **용도**: 브랜드 페이지

### 최종 추천
```
주요 스터디 (테코테코) → MDX
일반 스터디 → TipTap
프로필 → TipTap (이미 구현됨)
```

**두 개 다 쓰는 게 정답!**

*"적재적소에 맞는 도구를 쓰자"*