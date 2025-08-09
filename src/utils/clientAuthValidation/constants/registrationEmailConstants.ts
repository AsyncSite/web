/**
 * Registration Email Validation Constants
 * 
 * 회원가입 이메일 검증을 위한 상수 정의
 * 백엔드 EmailValidationService와 동기화
 */

/**
 * RFC 5322 준수 이메일 정규식
 * 더 엄격한 검증이 필요한 경우 사용
 */
export const REGISTRATION_EMAIL_RFC5322_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * 기본 이메일 형식 정규식
 * 빠른 검증을 위한 간단한 패턴
 */
export const REGISTRATION_EMAIL_BASIC_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * 이메일 길이 제한
 */
export const REGISTRATION_EMAIL_LENGTH_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 254,
  LOCAL_PART_MAX_LENGTH: 64,
  DOMAIN_PART_MAX_LENGTH: 253
} as const;

/**
 * 일회용 이메일 도메인 목록
 * 백엔드 EmailValidationService와 완전 동기화 (24개 도메인)
 */
export const DISPOSABLE_EMAIL_DOMAIN_BLACKLIST = [
  // 10분 메일 서비스
  '10minutemail.com',
  '10minutemail.net',
  
  // 임시 메일 서비스  
  'tempmail.com',
  'temp-mail.org',
  
  // 게릴라 메일
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  
  // Mailinator 계열
  'mailinator.com',
  'mailinator.net',
  
  // 기타 일회용 메일
  'throwaway.email',
  'yopmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'maildrop.cc',
  'getnada.com',
  'dispostable.com',
  'disposableemailaddresses.com',
  'tempinbox.com',
  'sharklasers.com',
  'spam4.me',
  'mailnesia.com',
  'mytemp.email'
] as const;

/**
 * 백엔드 동기화용 추가 일회용 도메인 패턴
 * 와일드카드 패턴으로 서브도메인도 차단
 */
export const BACKEND_SYNC_DISPOSABLE_PATTERNS = [
  /.*temp.*mail.*/i,
  /.*trash.*mail.*/i,
  /.*throw.*away.*/i,
  /.*disposable.*/i,
  /.*fake.*mail.*/i
] as const;

/**
 * 위험 패턴 목록 (XSS, Path Traversal 등)
 */
export const REGISTRATION_EMAIL_DANGEROUS_PATTERNS = [
  // XSS 관련 패턴
  '<script',
  '</script',
  'javascript:',
  'onclick=',
  'onerror=',
  'onload=',
  'onmouseover=',
  'onfocus=',
  'eval(',
  'alert(',
  
  // Path Traversal 패턴
  '../',
  '..\\',
  '%2e%2e%2f',
  '%2e%2e\\',
  
  // Null Byte Injection
  '%00',
  '\u0000',
  '\\x00',
  '\\0',
  
  // LDAP Injection
  '*(',
  '*)(',
  
  // Command Injection
  '|',
  '||',
  '&',
  '&&',
  ';',
  '`',
  '$(',
  '${',
] as const;

/**
 * 의심스러운 이메일 패턴
 */
export const REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS = {
  // 연속된 점
  CONSECUTIVE_DOTS: /\.\./,
  
  // 시작 또는 끝이 점
  STARTS_OR_ENDS_WITH_DOT: /^\.|\.@|@\.|\.$/,
  
  // 특수문자 과다 사용
  EXCESSIVE_SPECIAL_CHARS: /[!#$%&'*+\/=?^_`{|}~-]{3,}/,
  
  // 숫자만으로 된 로컬 파트
  NUMERIC_ONLY_LOCAL: /^[0-9]+@/,
  
  // 너무 긴 서브도메인
  EXCESSIVE_SUBDOMAINS: /(@[^.]+(\.[^.]+){4,})/
} as const;

/**
 * 이메일 도메인 화이트리스트 (선택적)
 * 기업 환경에서 특정 도메인만 허용할 때 사용
 */
export const REGISTRATION_EMAIL_DOMAIN_WHITELIST: string[] = [
  // 필요시 추가
  // 'company.com',
  // 'partner.org'
];

/**
 * 이메일 검증 메시지
 */
export const REGISTRATION_EMAIL_VALIDATION_MESSAGES = {
  CHECKING: '이메일 확인 중...',
  AVAILABLE: '사용 가능한 이메일입니다',
  INVALID_FORMAT: '올바른 이메일 형식을 입력해주세요',
  TOO_SHORT: `이메일은 최소 ${REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.MIN_LENGTH}자 이상이어야 합니다`,
  TOO_LONG: `이메일은 최대 ${REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.MAX_LENGTH}자까지 가능합니다`,
  DISPOSABLE_EMAIL: '일회용 이메일은 사용할 수 없습니다',
  DANGEROUS_PATTERN: '보안상 허용되지 않는 문자가 포함되어 있습니다',
  ALREADY_EXISTS: '이미 사용 중인 이메일입니다',
  DNS_CHECK_FAILED: '존재하지 않는 이메일 도메인입니다'
} as const;

/**
 * 이메일 검증 레벨
 */
export enum RegistrationEmailValidationLevel {
  BASIC = 'BASIC',           // 형식만 검증
  STANDARD = 'STANDARD',     // 형식 + 일회용 차단
  ENHANCED = 'ENHANCED',     // 형식 + 일회용 + 위험패턴
  STRICT = 'STRICT'          // 모든 검증 + DNS
}

/**
 * 도메인별 특별 규칙
 */
export const REGISTRATION_EMAIL_DOMAIN_SPECIFIC_RULES: Record<string, any> = {
  'gmail.com': {
    allowPlusAddressing: true,
    ignoreDots: true
  },
  'outlook.com': {
    allowPlusAddressing: false,
    ignoreDots: false
  },
  'hotmail.com': {
    allowPlusAddressing: false,
    ignoreDots: false
  }
};