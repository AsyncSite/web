# FAQ 섹션 내 커피챗 분리 시 영향 분석

## 📋 현재 상황

### FAQ 섹션 구조
```typescript
interface FAQSectionProps {
  items: FAQItem[];  // 질문/답변 목록
  showJoinCTA: boolean;  // 커피챗 표시 여부
  joinTitle: string;
  joinDescription: string;
  joinButtonText: string;
  kakaoOpenChatUrl: string;
}
```

### 관련 파일
- **컴포넌트**: `/web/src/components/studyDetailPage/sections/FAQSection.tsx`
- **Form**: `/web/src/components/studyDetailPage/editor/forms/FAQSectionForm.tsx`
- **백엔드 타입**: `/study-service/src/main/java/.../SectionType.java`

## ✅ 영향 분석 결과: 안전하게 분리 가능

### 분리 가능한 이유

#### 1. **독립적인 UI 블록**
- 커피챗은 FAQ 섹션의 하단에 조건부 렌더링(`showJoinCTA`)
- FAQ 아이템과 논리적으로 완전히 분리되어 있음
- 둘 사이에 데이터 의존성 없음

```tsx
// FAQSection.tsx (81-99줄)
{showJoinCTA && (
  <div className={styles.joinCtaBlock}>
    <h3 className={styles.joinCtaTitle}>{joinTitle}</h3>
    {joinDescription && <p className={styles.joinDescription}>{joinDescription}</p>}
    <button className={styles.joinContactButton}>
      {joinButtonText}
    </button>
  </div>
)}
```

#### 2. **백엔드 타입 시스템의 유연성**
- `SectionType` enum에 이미 모든 섹션 타입 정의됨
- FAQ는 독립적인 섹션 타입 (`SectionType.FAQ`)
- 새 타입 추가가 기존 시스템에 영향 없음

```java
// SectionType.java
public enum SectionType {
    FAQ("자주 묻는 질문", "FAQ 섹션"),
    // ... 다른 타입들
}
```

#### 3. **자유로운 props 구조**
- 각 섹션의 `props`는 JSON으로 저장
- 백엔드는 타입 검증 없이 저장/조회만 수행
- 프론트엔드에서 자유롭게 구조 정의 가능

## 🔄 분리 시 필요한 작업

### 1. 백엔드 변경 (study-service)

#### SectionType.java 수정
```java
// 파일: /study-service/src/main/java/.../SectionType.java
public enum SectionType {
    // 기존 타입들...
    FAQ("자주 묻는 질문", "FAQ 섹션"),

    // 추가
    COFFEE_CHAT("커피챗", "리더에게 커피챗 요청"),

    // 나머지 타입들...
}
```

### 2. 프론트엔드 변경 (web)

#### 2.1 새 컴포넌트 생성
```typescript
// 파일: /web/src/components/studyDetailPage/sections/CoffeeChatSection.tsx
interface CoffeeChatSectionProps {
  data: {
    joinTitle?: string;
    joinDescription?: string;
    joinButtonText?: string;
    kakaoOpenChatUrl?: string;
  };
}

const CoffeeChatSection: React.FC<CoffeeChatSectionProps> = ({ data }) => {
  const {
    joinTitle = '당신의 합류를 기다려요!',
    joinDescription = '',
    joinButtonText = '리더에게 커피챗 요청하기 ☕',
    kakaoOpenChatUrl = ''
  } = data;

  return (
    <section className={styles.coffeeChatSection}>
      <h3 className={styles.joinCtaTitle}>{joinTitle}</h3>
      {joinDescription && <p className={styles.joinDescription}>{joinDescription}</p>}
      <button
        className={styles.joinContactButton}
        onClick={() => {
          if (kakaoOpenChatUrl) {
            window.open(kakaoOpenChatUrl, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        {joinButtonText}
      </button>
    </section>
  );
};
```

#### 2.2 새 Form 생성
```typescript
// 파일: /web/src/components/studyDetailPage/editor/forms/CoffeeChatSectionForm.tsx
interface CoffeeChatSectionFormProps {
  initialData?: {
    joinTitle?: string;
    joinDescription?: string;
    joinButtonText?: string;
    kakaoOpenChatUrl?: string;
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CoffeeChatSectionForm: React.FC<CoffeeChatSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [joinTitle, setJoinTitle] = useState(initialData.joinTitle || '당신의 합류를 기다려요!');
  const [joinDescription, setJoinDescription] = useState(initialData.joinDescription || '');
  const [joinButtonText, setJoinButtonText] = useState(initialData.joinButtonText || '리더에게 커피챗 요청하기 ☕');
  const [kakaoOpenChatUrl, setKakaoOpenChatUrl] = useState(initialData.kakaoOpenChatUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kakaoOpenChatUrl) {
      alert('카카오톡 오픈채팅 URL은 필수입니다.');
      return;
    }

    onSave({
      joinTitle,
      joinDescription,
      joinButtonText,
      kakaoOpenChatUrl
    });
  };

  // Form UI 구현...
};
```

#### 2.3 SectionType enum 추가
```typescript
// 파일: /web/src/api/studyDetailPageService.ts
export enum SectionType {
  // 기존 타입들...
  FAQ = 'FAQ',
  COFFEE_CHAT = 'COFFEE_CHAT',  // 추가
  // 나머지 타입들...
}
```

#### 2.4 SectionEditForm 수정
```typescript
// 파일: /web/src/components/studyDetailPage/editor/SectionEditForm.tsx
case SectionType.COFFEE_CHAT:
  return (
    <CoffeeChatSectionForm
      initialData={initialData}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
```

#### 2.5 SectionRenderer 수정
```typescript
// 파일: /web/src/components/studyDetailPage/sections/index.tsx
case SectionType.COFFEE_CHAT:
  return <CoffeeChatSection data={data} />;
```

### 3. 기존 FAQ 섹션 정리

#### 3.1 FAQSection.tsx 수정
```typescript
// showJoinCTA 관련 props 제거
interface FAQSectionProps {
  data: {
    items: Array<{
      question: string;
      answer: string;
      id?: number | string;
    }>;
    title?: string;
    tagHeader?: string;
    showIcons?: boolean;
  };
  // joinTitle, joinDescription 등 제거
}

// JSX에서 커피챗 블록 제거 (81-99줄)
```

#### 3.2 FAQSectionForm.tsx 수정
```typescript
// 커피챗 관련 state 제거
const [showJoinCTA, setShowJoinCTA] = useState(false);  // 제거
const [joinTitle, setJoinTitle] = useState('');  // 제거
// ... 기타 커피챗 관련 state 제거

// handleSubmit에서 커피챗 관련 필드 제거
onSave({
  title,
  tagHeader,
  showIcons,
  items: validFaqs
  // showJoinCTA 등 제거
});

// Form UI에서 커피챗 관련 필드 제거 (253-314줄)
```

#### 3.3 템플릿 데이터 수정
```typescript
// algorithmTemplate.ts, mogakupTemplate.ts, bookStudyTemplate.ts
sections: {
  faq: {
    // showJoinCTA 관련 필드 제거
    items: [/* FAQ 목록 */]
  },
  // 새로 추가
  coffeeChat: {
    joinTitle: '당신의 합류를 기다려요!',
    joinDescription: '',
    joinButtonText: '리더에게 커피챗 요청하기 ☕',
    kakaoOpenChatUrl: ''
  }
}
```

## ⚠️ 주의사항

### 1. 기존 데이터 마이그레이션 불필요
- FAQ 섹션에 커피챗 정보가 있어도 무시하면 됨
- 프론트엔드에서 렌더링하지 않으면 표시 안 됨
- 새로운 스터디는 별도 섹션으로 추가

### 2. 스터디 제안/수정 플로우 영향 없음
- 관리 페이지에서 섹션 추가/삭제만 하면 됨
- API 구조 변경 불필요
- 백엔드는 JSON 저장만 담당

### 3. 템플릿 데이터 업데이트 필요
- `algorithmTemplate.ts`
- `mogakupTemplate.ts`
- `bookStudyTemplate.ts`
- 각각 FAQ와 COFFEE_CHAT 분리

### 4. 섹션 순서 관리
- 커피챗은 보통 페이지 하단에 위치
- 관리 페이지에서 섹션 순서 조정 가능
- `order` 필드로 순서 제어

## 📝 마이그레이션 체크리스트

### Phase 1: 백엔드
- [ ] `SectionType.java`에 `COFFEE_CHAT` 추가
- [ ] 빌드 및 테스트 확인
- [ ] Docker 재빌드 (`./gradlew dockerRebuildAndRunStudyOnly`)

### Phase 2: 프론트엔드 - 새 컴포넌트
- [ ] `CoffeeChatSection.tsx` 생성
- [ ] `CoffeeChatSectionForm.tsx` 생성
- [ ] CSS 모듈 생성 (`CoffeeChatSection.module.css`)
- [ ] `SectionType` enum에 추가
- [ ] `SectionEditForm`에 case 추가
- [ ] `SectionRenderer`에 case 추가

### Phase 3: 프론트엔드 - 기존 컴포넌트 정리
- [ ] `FAQSection.tsx`에서 커피챗 블록 제거
- [ ] `FAQSectionForm.tsx`에서 커피챗 필드 제거
- [ ] 템플릿 데이터 수정
- [ ] TypeScript 컴파일 확인 (`npx tsc --noEmit`)

### Phase 4: 테스트
- [ ] 기존 FAQ 섹션 표시 확인
- [ ] 새 커피챗 섹션 추가/수정/삭제 테스트
- [ ] 템플릿 적용 테스트
- [ ] 모바일 반응형 확인

### Phase 5: 문서화
- [ ] 변경사항 기록
- [ ] API 문서 업데이트 (필요시)
- [ ] 팀원 공유

## 🎯 결론

**완전히 안전하게 분리 가능합니다.**

- ✅ 스터디 제안 플로우 영향 없음
- ✅ 스터디 수정 플로우 영향 없음
- ✅ 기존 데이터 영향 없음
- ✅ 백엔드 API 변경 불필요 (SectionType만 추가)
- ✅ 독립적인 기능으로 더 나은 UX 제공 가능

### 추가 장점
1. **관심사 분리**: FAQ와 커피챗의 책임 명확화
2. **재사용성**: 커피챗을 다른 위치에서도 사용 가능
3. **유지보수**: 각 컴포넌트의 코드가 간결해짐
4. **확장성**: 커피챗 기능 확장 시 다른 섹션에 영향 없음

### 권장사항
- 분리 작업은 한 번에 진행하는 것이 좋음
- 백엔드 → 프론트엔드 순서로 진행
- 충분한 테스트 후 배포
