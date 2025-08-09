# 웹 프론트엔드 검증 시스템 동기화 계획

> 작성일: 2025-08-09  
> 목적: 백엔드 검증 시스템과 프론트엔드 검증 로직 동기화

## 📊 현재 상태 분석

### 백엔드 (user-service) 검증 규칙

#### 이메일 검증 (EmailValidationService)
```kotlin
// 서버측 검증 규칙
- RFC 5322 준수 이메일 형식
- 최소 3자, 최대 254자
- 일회용 이메일 도메인 차단 (24개)
- 위험 패턴 차단 (XSS, Path Traversal)
- DNS MX 레코드 확인 (프로덕션)
- 중복 이메일 확인
```

#### 비밀번호 검증 (PasswordValidationService)
```kotlin
// 서버측 검증 규칙
- 최소 8자, 최대 128자
- 대문자, 소문자, 숫자, 특수문자 중 3종류 이상
- 연속 문자 금지 (abc, 123 등 3자 이상)
- 반복 문자 금지 (aaa, 111 등 3자 이상)
- 개인정보 포함 금지 (이메일, 이름)
- 엔트로피 최소 30 이상
- 공통 비밀번호 차단 (복잡한 변형은 허용)
```

#### 이름 검증 (NameValidationService)
```kotlin
// 서버측 검증 규칙
- 최소 2자, 최대 50자
- 한글, 영문, 숫자, 공백, 점(.), 하이픈(-), 어포스트로피(')만 허용
- HTML 태그 차단
- SQL 키워드 차단
- 제어 문자 차단
- 이모지 차단
```

### 프론트엔드 (web) 현재 검증 로직

#### SignupPage.tsx
```typescript
// 현재 이메일 검증
- 정규식: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
- 중복 확인 API 호출
- 길이 제한 없음 ❌
- 일회용 이메일 차단 없음 ❌
- 위험 패턴 차단 없음 ❌

// 현재 비밀번호 검증
- 최소 8자 이상 ✅
- 영문, 숫자, 특수문자(@$!%*?&) 포함 필수 ⚠️ (서버는 3종류 중 선택)
- 연속/반복 문자 검증 없음 ❌
- 개인정보 포함 검증 없음 ❌
- 엔트로피 측정 없음 ❌

// 현재 이름 검증
- 최소 2자, 최대 50자 ✅
- 특수문자 검증 없음 ❌
- XSS/SQL Injection 방지 없음 ❌
```

#### PasswordChangeModal.tsx
```typescript
// 현재 비밀번호 변경 검증
- 최소 8자 이상 ✅
- 대문자, 소문자, 숫자 필수 ⚠️ (특수문자 미포함)
- 비밀번호 강도 표시 (약함/보통/강함) ✅
```

## 🔍 차이점 및 문제점

### 1. 검증 규칙 불일치
- **이메일**: 클라이언트 검증이 너무 단순함
- **비밀번호**: 서버는 3종류 중 선택, 클라이언트는 모두 필수
- **이름**: 클라이언트에 보안 검증 전무

### 2. 사용자 경험 문제
- 클라이언트에서 통과한 입력이 서버에서 거부될 수 있음
- 에러 메시지가 구체적이지 않음
- 실시간 피드백 부족

### 3. 보안 취약점
- XSS, SQL Injection 방지 로직 없음
- 위험 패턴 필터링 없음
- 일회용 이메일 차단 없음

## 🎯 구현 계획

### Phase 1: 검증 유틸리티 함수 구현 (우선순위: 높음)

#### 1. ValidationService 모듈 생성
```typescript
// src/utils/validation/index.ts
export * from './emailValidator';
export * from './passwordValidator';
export * from './nameValidator';
```

#### 2. EmailValidator 구현
```typescript
// src/utils/validation/emailValidator.ts
export class EmailValidator {
  // RFC 5322 정규식
  private static EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  // 일회용 이메일 도메인
  private static DISPOSABLE_DOMAINS = [
    '10minutemail.com', 'tempmail.com', // ... 24개
  ];
  
  // 위험 패턴
  private static DANGEROUS_PATTERNS = [
    '<script', 'javascript:', 'onclick=', // XSS
    '../', '..\\', '%00' // Path Traversal
  ];
  
  static validate(email: string): ValidationResult {
    // 구현
  }
}
```

#### 3. PasswordValidator 구현
```typescript
// src/utils/validation/passwordValidator.ts
export class PasswordValidator {
  // 엔트로피 계산
  static calculateEntropy(password: string): number { }
  
  // 연속/반복 문자 검증
  static hasSequentialChars(password: string): boolean { }
  
  // 개인정보 포함 검증
  static containsPersonalInfo(password: string, email: string, name: string): boolean { }
  
  // 통합 검증
  static validate(password: string, context?: UserContext): ValidationResult { }
  
  // 비밀번호 강도 측정
  static getStrength(password: string): PasswordStrength { }
}
```

#### 4. NameValidator 구현
```typescript
// src/utils/validation/nameValidator.ts
export class NameValidator {
  // 허용 문자 패턴
  private static ALLOWED_CHARS = /^[가-힣a-zA-Z0-9\s.\-']+$/;
  
  // 위험 패턴
  private static DANGEROUS_PATTERNS = {
    xss: /<[^>]*>/g,
    sql: /\b(SELECT|DROP|DELETE|INSERT|UPDATE)\b/gi
  };
  
  static validate(name: string): ValidationResult { }
}
```

### Phase 2: UI 컴포넌트 개선 (우선순위: 높음)

#### 1. 실시간 검증 피드백 컴포넌트
```typescript
// src/components/common/ValidationFeedback.tsx
interface ValidationFeedbackProps {
  field: 'email' | 'password' | 'name';
  value: string;
  context?: UserContext;
  onChange?: (result: ValidationResult) => void;
}

export function ValidationFeedback({ field, value, context }: ValidationFeedbackProps) {
  // 실시간 검증 및 피드백 표시
}
```

#### 2. 비밀번호 강도 표시기 개선
```typescript
// src/components/common/PasswordStrengthMeter.tsx
export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = PasswordValidator.getStrength(password);
  const entropy = PasswordValidator.calculateEntropy(password);
  
  // 시각적 강도 표시 (프로그레스 바, 색상 등)
}
```

#### 3. 에러 메시지 개선
```typescript
// src/components/common/ValidationError.tsx
export function ValidationError({ errors }: { errors: ValidationError[] }) {
  // 구체적이고 도움이 되는 에러 메시지 표시
  // 예: "비밀번호에 연속된 문자(abc, 123)가 포함되어 있습니다"
}
```

### Phase 3: 페이지 통합 (우선순위: 중간)

#### 1. SignupPage 개선
- ValidationService 통합
- 실시간 검증 피드백
- 단계별 검증 강화
- 구체적인 에러 메시지

#### 2. LoginPage 개선
- 이메일 형식 검증
- 보안 패턴 검사

#### 3. PasswordChangeModal 개선
- 새 비밀번호 검증 규칙 동기화
- 엔트로피 기반 강도 측정
- 개인정보 포함 검증

#### 4. ProfileEditPage 검증 추가
- 이름 변경 시 검증
- XSS/SQL Injection 방지

### Phase 4: 테스트 및 문서화 (우선순위: 중간)

#### 1. 단위 테스트
```typescript
// src/utils/validation/__tests__/
- emailValidator.test.ts
- passwordValidator.test.ts
- nameValidator.test.ts
```

#### 2. 통합 테스트
- 회원가입 플로우 테스트
- 비밀번호 변경 테스트
- 프로필 수정 테스트

#### 3. 문서화
- 검증 규칙 문서
- 에러 코드 매핑
- 사용자 가이드

## 🚀 구현 우선순위

### 즉시 구현 (Day 1)
1. ✅ ValidationService 기본 구조 생성
2. ✅ EmailValidator 핵심 기능
3. ✅ PasswordValidator 핵심 기능
4. ✅ NameValidator 핵심 기능

### 단기 구현 (Day 2-3)
1. ⏳ SignupPage 검증 통합
2. ⏳ PasswordChangeModal 개선
3. ⏳ 실시간 피드백 컴포넌트
4. ⏳ 에러 메시지 개선

### 중기 구현 (Week 1)
1. ⏳ 전체 페이지 통합
2. ⏳ 테스트 작성
3. ⏳ 문서화

## 📝 예상 파일 구조

```
src/
├── utils/
│   └── validation/
│       ├── index.ts
│       ├── types.ts
│       ├── emailValidator.ts
│       ├── passwordValidator.ts
│       ├── nameValidator.ts
│       ├── constants.ts
│       └── __tests__/
│           ├── emailValidator.test.ts
│           ├── passwordValidator.test.ts
│           └── nameValidator.test.ts
├── components/
│   └── common/
│       ├── ValidationFeedback.tsx
│       ├── PasswordStrengthMeter.tsx
│       └── ValidationError.tsx
└── constants/
    └── validation.ts  // 검증 관련 상수
```

## ⚠️ 주의사항

1. **점진적 마이그레이션**: 기존 코드를 한 번에 변경하지 말고 단계적으로 적용
2. **하위 호환성**: 기존 API와의 호환성 유지
3. **성능 고려**: 실시간 검증 시 디바운싱 적용
4. **접근성**: 스크린 리더 지원, ARIA 속성 추가
5. **국제화**: 에러 메시지 다국어 지원 고려

## 🔄 백엔드 동기화 체크리스트

- [ ] 일회용 이메일 도메인 리스트 동기화
- [ ] 위험 패턴 리스트 동기화
- [ ] 공통 비밀번호 리스트 동기화
- [ ] 엔트로피 계산 알고리즘 동기화
- [ ] 에러 코드 및 메시지 동기화

## 📊 예상 효과

1. **보안 강화**: XSS, SQL Injection 방지
2. **사용자 경험 개선**: 실시간 피드백, 구체적인 에러 메시지
3. **개발 효율성**: 재사용 가능한 검증 모듈
4. **유지보수성**: 중앙화된 검증 로직
5. **일관성**: 백엔드와 동일한 검증 규칙