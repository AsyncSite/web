# Async Site 폰트 시스템 가이드

## 📝 폰트 규칙

### 🎯 기본 원칙
- **일관성**: 모든 컴포넌트에서 동일한 폰트 시스템 사용
- **가독성**: 언어별 최적화된 폰트 적용
- **브랜딩**: Space Grotesk로 브랜드 아이덴티티 강화

### 🔤 폰트 분류

#### 1. 타이틀 (제목)
- **폰트**: Space Grotesk
- **용도**: 페이지 제목, 섹션 제목, 카드 제목
- **클래스**: `font-space-grotesk`
- **예시**: `<h1 className="font-space-grotesk">Calendar</h1>`

#### 2. 영어 본문
- **폰트**: Poppins
- **용도**: 영어 텍스트, 버튼, 라벨
- **클래스**: `font-poppins` 또는 `font-sans`
- **예시**: `<p className="font-poppins">English text</p>`

#### 3. 한글 본문
- **폰트**: SUIT
- **용도**: 한글 텍스트, 설명문
- **클래스**: `font-suit` 또는 `font-sans`
- **예시**: `<p className="font-suit">한글 텍스트</p>`

#### 4. 특수 용도
- **폰트**: DungGeunMo (픽셀 폰트)
- **용도**: 특별한 디자인 요소 (필요시만)
- **클래스**: `font-dunggeun`

### 🎨 Tailwind 설정

```javascript
fontFamily: {
  'space-grotesk': ['Space Grotesk', 'sans-serif'],  // 타이틀
  'poppins': ['Poppins', 'sans-serif'],              // 영어
  'suit': ['SUIT', 'sans-serif'],                    // 한글
  'dunggeun': ['DungGeunMo', 'monospace'],           // 특수
  'sans': ['Poppins', 'SUIT', 'sans-serif'],         // 기본 (영어+한글)
}
```

### 📋 컴포넌트별 적용 예시

#### Card 컴포넌트
```tsx
// 타이틀: Space Grotesk
<CardTitle className="font-space-grotesk">제목</CardTitle>

// 본문: 영어(Poppins) + 한글(SUIT)
<CardDescription className="font-sans">설명 텍스트</CardDescription>
```

#### 페이지 헤더
```tsx
// 타이틀: Space Grotesk
<h1 className="font-space-grotesk">Calendar</h1>

// 한글 본문: SUIT
<p className="font-suit">한글 설명</p>

// 영어 본문: Poppins
<p className="font-poppins">English description</p>
```

#### 버튼
```tsx
// 영어+한글 혼용: font-sans
<button className="font-sans">버튼 텍스트</button>
```

### ⚠️ 주의사항

1. **일관성 유지**: 새로운 컴포넌트 작성 시 반드시 이 가이드 준수
2. **주석 추가**: 폰트 적용 시 주석으로 의도 명시
3. **테스트**: 다양한 언어 조합에서 가독성 확인
4. **업데이트**: 폰트 변경 시 이 문서도 함께 업데이트

### 🔍 체크리스트

새 컴포넌트 작성 시:
- [ ] 타이틀에 `font-space-grotesk` 적용
- [ ] 영어 텍스트에 `font-poppins` 또는 `font-sans` 적용  
- [ ] 한글 텍스트에 `font-suit` 또는 `font-sans` 적용
- [ ] 폰트 의도를 주석으로 명시
- [ ] 다양한 화면 크기에서 테스트

### 📚 참고 링크

- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- [Poppins](https://fonts.google.com/specimen/Poppins)
- [SUIT](https://sunn.us/suit/)
- [Tailwind CSS Typography](https://tailwindcss.com/docs/font-family)
