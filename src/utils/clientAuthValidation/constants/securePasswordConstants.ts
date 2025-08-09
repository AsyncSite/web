/**
 * Secure Password Validation Constants
 * 
 * 보안 비밀번호 검증을 위한 상수 정의
 * 백엔드 PasswordValidationService와 동기화
 */

/**
 * 비밀번호 길이 제한
 */
export const SECURE_PASSWORD_LENGTH_LIMITS = {
  ABSOLUTE_MIN: 8,
  RECOMMENDED_MIN: 12,
  OPTIMAL_MIN: 14,
  ABSOLUTE_MAX: 128,
  RECOMMENDED_MAX: 64
} as const;

/**
 * 문자 종류별 패턴
 */
export const SECURE_PASSWORD_CHARACTER_PATTERNS = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBERS: /[0-9]/,
  SPECIAL_CHARS: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  EXTENDED_SPECIAL: /[`~₩]/,
  SPACE: /\s/
} as const;

/**
 * 특수문자 목록
 */
export const SECURE_PASSWORD_SPECIAL_CHARACTERS = '!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~₩' as const;

/**
 * 문자 종류 요구사항
 */
export const SECURE_PASSWORD_CHARACTER_REQUIREMENTS = {
  MINIMUM_CHARACTER_TYPES: 3,  // 최소 3종류
  RECOMMENDED_CHARACTER_TYPES: 4  // 권장 4종류
} as const;

/**
 * 연속/반복 문자 제한
 * 백엔드 PasswordValidationService와 동기화
 */
export const SECURE_PASSWORD_PATTERN_LIMITS = {
  MAX_SEQUENTIAL_CHARS: 3,  // abc, 123 등 최대 3자 (백엔드는 4자 이상 금지)
  MAX_REPEATED_CHARS: 2,     // aa, 11 등 최대 2자 (백엔드는 3자 이상 금지)
  MAX_KEYBOARD_PATTERN: 4    // qwer, asdf 등 최대 4자
} as const;

/**
 * 백엔드 동기화용 검증 규칙
 */
export const BACKEND_SYNC_PASSWORD_RULES = {
  MIN_SEQUENTIAL_LENGTH_TO_CHECK: 4,  // 4자 이상 연속 문자 검사
  MIN_REPEATED_LENGTH_TO_CHECK: 3,    // 3자 이상 반복 문자 검사
  MIN_ENTROPY_REQUIRED: 35,           // 최소 엔트로피 35
  MIN_CHARACTER_CATEGORIES: 3         // 최소 3종류 문자
} as const;

/**
 * 키보드 패턴 (QWERTY 배열)
 */
export const SECURE_PASSWORD_KEYBOARD_PATTERNS = [
  // 가로 패턴
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  
  // 숫자 패턴
  '1234567890',
  '0987654321',
  
  // 대각선 패턴
  'qaz',
  'wsx',
  'edc',
  'rfv',
  'tgb',
  'yhn',
  'ujm',
  
  // 한글 키보드 패턴
  'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ',
  'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ',
  'ㅋㅌㅊㅍㅠㅜㅡ'
] as const;

/**
 * 공통 비밀번호 목록 (상위 100개)
 */
export const SECURE_PASSWORD_COMMON_PASSWORDS = [
  // 숫자 패턴
  '123456',
  '123456789',
  '12345678',
  '1234567890',
  '1234567',
  '123123',
  '111111',
  '000000',
  
  // 문자 패턴
  'password',
  'Password',
  'PASSWORD',
  'password1',
  'password123',
  'Password1',
  'Password123',
  'passw0rd',
  'p@ssw0rd',
  'P@ssw0rd',
  
  // 키보드 패턴
  'qwerty',
  'qwerty123',
  'qwertyuiop',
  'asdfgh',
  'asdfghjkl',
  'zxcvbn',
  'qazwsx',
  
  // 한글 패턴
  '비밀번호',
  
  // 일반적인 단어
  'admin',
  'Admin',
  'administrator',
  'root',
  'test',
  'Test',
  'test123',
  'demo',
  'Demo',
  'demo123',
  'user',
  'User',
  'user123',
  'guest',
  'Guest',
  
  // 날짜 패턴
  '20242024',
  '20232023',
  '20222022',
  '12341234',
  
  // 기타 흔한 패턴
  'welcome',
  'Welcome',
  'welcome123',
  'hello',
  'Hello',
  'hello123',
  'letmein',
  'login',
  'Login',
  'abc123',
  'Abc123',
  'monkey',
  'dragon',
  'master',
  'Master'
] as const;

/**
 * 공통 비밀번호 베이스 단어 (변형 감지용)
 */
export const SECURE_PASSWORD_COMMON_BASE_WORDS = [
  'password',
  'admin',
  'test',
  'demo',
  'user',
  'guest',
  'welcome',
  'hello',
  'login',
  'master',
  'monkey',
  'dragon',
  'football',
  'baseball',
  'soccer',
  'hockey',
  'iloveyou',
  'sunshine',
  'princess',
  'superman',
  'batman'
] as const;

/**
 * 엔트로피 계산용 문자셋 크기
 */
export const SECURE_PASSWORD_CHARSET_SIZES = {
  LOWERCASE: 26,
  UPPERCASE: 26,
  DIGITS: 10,
  SPECIAL: 32,
  EXTENDED_SPECIAL: 8,
  SPACE: 1,
  UNICODE: 94  // 인쇄 가능한 ASCII 문자
} as const;

/**
 * 엔트로피 기반 강도 임계값
 * 백엔드 PasswordValidationService와 동기화
 */
export const SECURE_PASSWORD_ENTROPY_THRESHOLDS = {
  CRITICALLY_WEAK: 25,
  VERY_WEAK: 30,
  WEAK: 35,          // 백엔드 MIN_ENTROPY와 동기화
  MODERATE: 50,
  STRONG: 60,
  VERY_STRONG: 70,
  EXCEPTIONALLY_STRONG: 80
} as const;

/**
 * 백엔드 동기화용 강도 분류
 * 백엔드 PasswordStrength enum과 일치
 */
export const BACKEND_SYNC_PASSWORD_STRENGTH = {
  VERY_WEAK: { min: 0, max: 30, label: 'VERY_WEAK' },
  WEAK: { min: 30, max: 40, label: 'WEAK' },
  MEDIUM: { min: 40, max: 50, label: 'MEDIUM' },
  STRONG: { min: 50, max: 60, label: 'STRONG' },
  VERY_STRONG: { min: 60, max: 100, label: 'VERY_STRONG' }
} as const;

/**
 * 예상 크랙 시간 (엔트로피 기반)
 */
export const SECURE_PASSWORD_CRACK_TIME_ESTIMATES = {
  25: '즉시',
  30: '몇 초',
  35: '몇 분',
  40: '몇 시간',
  45: '며칠',
  50: '몇 주',
  55: '몇 달',
  60: '몇 년',
  65: '수십 년',
  70: '수백 년',
  75: '수천 년',
  80: '사실상 불가능'
} as const;

/**
 * 비밀번호 검증 메시지
 */
export const SECURE_PASSWORD_VALIDATION_MESSAGES = {
  // 길이 관련
  TOO_SHORT: `비밀번호는 최소 ${SECURE_PASSWORD_LENGTH_LIMITS.ABSOLUTE_MIN}자 이상이어야 합니다`,
  TOO_LONG: `비밀번호는 최대 ${SECURE_PASSWORD_LENGTH_LIMITS.ABSOLUTE_MAX}자까지 가능합니다`,
  
  // 문자 종류 관련
  INSUFFICIENT_TYPES: '대문자, 소문자, 숫자, 특수문자 중 3종류 이상을 포함해야 합니다',
  NO_UPPERCASE: '대문자를 포함해주세요',
  NO_LOWERCASE: '소문자를 포함해주세요',
  NO_NUMBERS: '숫자를 포함해주세요',
  NO_SPECIAL: '특수문자를 포함해주세요',
  
  // 패턴 관련
  SEQUENTIAL_CHARS: '연속된 문자나 숫자는 사용할 수 없습니다',
  REPEATED_CHARS: '같은 문자를 연속으로 사용할 수 없습니다',
  KEYBOARD_PATTERN: '키보드 패턴은 사용할 수 없습니다',
  
  // 개인정보 관련
  CONTAINS_EMAIL: '비밀번호에 이메일이 포함되어 있습니다',
  CONTAINS_NAME: '비밀번호에 이름이 포함되어 있습니다',
  
  // 강도 관련
  TOO_WEAK: '비밀번호가 너무 약합니다',
  COMMON_PASSWORD: '너무 흔한 비밀번호입니다',
  
  // 성공
  STRONG_PASSWORD: '안전한 비밀번호입니다'
} as const;

/**
 * 비밀번호 개선 제안
 */
export const SECURE_PASSWORD_IMPROVEMENT_TIPS = {
  ADD_LENGTH: '비밀번호를 더 길게 만들면 보안이 강화됩니다',
  ADD_UPPERCASE: '대문자(A-Z)를 포함하면 더 안전합니다',
  ADD_LOWERCASE: '소문자(a-z)를 포함하면 더 안전합니다',
  ADD_NUMBERS: '숫자(0-9)를 포함하면 더 안전합니다',
  ADD_SPECIAL: '특수문자(!@#$%^&*)를 포함하면 더 안전합니다',
  MIX_CHARACTERS: '문자를 더 다양하게 섞어주세요',
  AVOID_PATTERNS: '예측 가능한 패턴을 피하세요',
  USE_PASSPHRASE: '기억하기 쉬운 문장을 활용해보세요',
  NO_PERSONAL_INFO: '개인정보를 포함하지 마세요',
  UNIQUE_PASSWORD: '다른 사이트와 다른 비밀번호를 사용하세요'
} as const;