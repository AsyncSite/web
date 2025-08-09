/**
 * Client Authentication Validation Module
 * 
 * 백엔드와 동기화된 클라이언트 측 폼 검증 시스템
 * 
 * @example
 * ```typescript
 * import { 
 *   validateRegistrationForm, 
 *   registrationEmailValidator,
 *   ClientPasswordStrengthTier 
 * } from 'utils/clientAuthValidation';
 * 
 * // 회원가입 폼 전체 검증
 * const validation = validateRegistrationForm(email, password, confirmPassword, name);
 * if (validation.isFormValid) {
 *   // 제출 가능
 * }
 * 
 * // 개별 필드 검증
 * const emailValidation = registrationEmailValidator.validateRegistrationEmail(email);
 * ```
 */

// 타입 정의
export * from './types';

// 상수
export * from './constants';

// 검증기
export * from './validators';

// 편의 함수들
export {
  validateRegistrationForm,
  validateLoginForm,
  validatePasswordChangeForm
} from './validators';

// 기본 검증기 인스턴스들
export {
  registrationEmailValidator,
  securePasswordValidator,
  profileNameValidator
} from './validators';

/**
 * 모듈 버전 정보
 */
export const CLIENT_AUTH_VALIDATION_VERSION = '1.0.0';

/**
 * 백엔드 동기화 날짜
 */
export const BACKEND_SYNC_DATE = '2025-08-09';

/**
 * 모듈 설명
 */
export const MODULE_INFO = {
  name: 'Client Authentication Validation',
  version: CLIENT_AUTH_VALIDATION_VERSION,
  syncDate: BACKEND_SYNC_DATE,
  description: '백엔드 검증 시스템과 동기화된 클라이언트 측 폼 검증 모듈',
  features: [
    '이메일 검증 (RFC 5322, 일회용 차단, XSS 방지)',
    '비밀번호 검증 (엔트로피 계산, 패턴 검사, 개인정보 포함 체크)',
    '이름 검증 (XSS, SQL Injection, 이모지 차단)',
    '실시간 검증 지원',
    '성능 최적화 (캐싱, 디바운싱)',
    '한국어 에러 메시지'
  ]
} as const;