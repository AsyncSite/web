/**
 * Client-side Authentication Form Validation Types
 * 
 * 백엔드 검증 시스템과 동기화된 클라이언트 측 폼 검증 타입
 * 네이밍 규칙:
 * - ClientAuth: 클라이언트 인증 관련
 * - Registration/Login/Profile: 사용 컨텍스트
 * - Input/Form: UI 레이어 명시
 * - Realtime/Enhanced: 특성 명시
 */

/**
 * 클라이언트 인증 폼 검증 결과
 */
export interface ClientAuthFormValidationResult {
  isValid: boolean;
  fieldErrors: ClientAuthFieldError[];
  fieldWarnings?: ClientAuthFieldWarning[];
  enhancedMetadata?: ClientAuthValidationMetadata;
  performanceMetrics?: {
    validationTimeMs: number;
    asyncChecksCompleted: boolean;
  };
}

/**
 * 필드별 검증 에러
 */
export interface ClientAuthFieldError {
  errorCode: string;
  errorMessage: string;
  fieldName: 'registrationEmail' | 'loginEmail' | 'signupPassword' | 'changePassword' | 'profileName';
  errorSeverity: 'critical' | 'major' | 'minor';
  errorDetails?: {
    rejectedValue?: string;
    expectedFormat?: string;
    violatedRule?: string;
  };
}

/**
 * 필드별 검증 경고
 */
export interface ClientAuthFieldWarning {
  warningCode: string;
  warningMessage: string;
  improvementSuggestion?: string;
  securityRiskLevel?: 'low' | 'medium' | 'high';
}

/**
 * 향상된 검증 메타데이터
 */
export interface ClientAuthValidationMetadata {
  // 등록 이메일 관련
  registrationEmailMetrics?: {
    domainName?: string;
    isDisposableEmailProvider?: boolean;
    emailRiskScore?: number;
    dnsMxRecordExists?: boolean;
  };
  
  // 보안 비밀번호 관련
  securePasswordMetrics?: {
    strengthLevel?: ClientPasswordStrengthTier;
    entropyScore?: number;
    estimatedCrackTime?: string;
    improvementTips?: string[];
    characterSetDiversity?: number;
  };
  
  // 프로필 이름 관련
  profileNameMetrics?: {
    sanitizedValue?: string;
    detectedLanguages?: string[];
    suspiciousPatterns?: string[];
  };
}

/**
 * 사용자 컨텍스트 (개인정보 교차 검증용)
 */
export interface RegistrationUserContext {
  registrationEmailValue?: string;
  profileNameValue?: string;
  existingPasswordHash?: string;
}

/**
 * 클라이언트 비밀번호 강도 등급
 */
export enum ClientPasswordStrengthTier {
  CRITICALLY_WEAK = 'CRITICALLY_WEAK',     // 엔트로피 < 25
  VERY_WEAK = 'VERY_WEAK',                 // 엔트로피 25-30
  WEAK = 'WEAK',                            // 엔트로피 30-40
  MODERATE = 'MODERATE',                    // 엔트로피 40-50
  STRONG = 'STRONG',                        // 엔트로피 50-60
  VERY_STRONG = 'VERY_STRONG',             // 엔트로피 60-70
  EXCEPTIONALLY_STRONG = 'EXCEPTIONALLY_STRONG' // 엔트로피 > 70
}

/**
 * 실시간 검증 옵션
 */
export interface RealtimeValidationOptions {
  // 공통 설정
  enableRealtimeFeedback?: boolean;
  debounceDelayMs?: number;
  validationLocale?: 'ko' | 'en';
  
  // 등록 이메일 검증 옵션
  registrationEmailOptions?: {
    checkDuplicateViaAPI?: boolean;
    skipDNSVerification?: boolean;
    allowPlusAddressing?: boolean;
    blockDisposableEmails?: boolean;
  };
  
  // 보안 비밀번호 검증 옵션
  securePasswordOptions?: {
    minimumLength?: number;
    maximumLength?: number;
    requireMixedCase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    minimumCharacterTypes?: number;
    checkAgainstCommonPasswords?: boolean;
    checkPersonalInfoInclusion?: boolean;
  };
  
  // 프로필 이름 검증 옵션
  profileNameOptions?: {
    allowUnicodeChars?: boolean;
    allowEmojis?: boolean;
    allowSpecialSymbols?: boolean;
    preventXSSPatterns?: boolean;
    preventSQLInjection?: boolean;
  };
}

/**
 * 클라이언트 검증 에러 코드 (상세 분류)
 */
export const ClientAuthValidationErrorCodes = {
  // 등록 이메일 에러
  REGISTRATION_EMAIL_FIELD_EMPTY: 'REGISTRATION_EMAIL_FIELD_EMPTY',
  REGISTRATION_EMAIL_FORMAT_INVALID: 'REGISTRATION_EMAIL_FORMAT_INVALID',
  REGISTRATION_EMAIL_LENGTH_TOO_SHORT: 'REGISTRATION_EMAIL_LENGTH_TOO_SHORT',
  REGISTRATION_EMAIL_LENGTH_TOO_LONG: 'REGISTRATION_EMAIL_LENGTH_TOO_LONG',
  REGISTRATION_EMAIL_DISPOSABLE_BLOCKED: 'REGISTRATION_EMAIL_DISPOSABLE_BLOCKED',
  REGISTRATION_EMAIL_DANGEROUS_PATTERN: 'REGISTRATION_EMAIL_DANGEROUS_PATTERN',
  REGISTRATION_EMAIL_ALREADY_EXISTS: 'REGISTRATION_EMAIL_ALREADY_EXISTS',
  REGISTRATION_EMAIL_DNS_INVALID: 'REGISTRATION_EMAIL_DNS_INVALID',
  
  // 보안 비밀번호 에러
  SECURE_PASSWORD_FIELD_EMPTY: 'SECURE_PASSWORD_FIELD_EMPTY',
  SECURE_PASSWORD_LENGTH_TOO_SHORT: 'SECURE_PASSWORD_LENGTH_TOO_SHORT',
  SECURE_PASSWORD_LENGTH_TOO_LONG: 'SECURE_PASSWORD_LENGTH_TOO_LONG',
  SECURE_PASSWORD_CHAR_TYPES_INSUFFICIENT: 'SECURE_PASSWORD_CHAR_TYPES_INSUFFICIENT',
  SECURE_PASSWORD_SEQUENTIAL_PATTERN: 'SECURE_PASSWORD_SEQUENTIAL_PATTERN',
  SECURE_PASSWORD_REPEATED_PATTERN: 'SECURE_PASSWORD_REPEATED_PATTERN',
  SECURE_PASSWORD_PERSONAL_INFO_INCLUDED: 'SECURE_PASSWORD_PERSONAL_INFO_INCLUDED',
  SECURE_PASSWORD_ENTROPY_TOO_LOW: 'SECURE_PASSWORD_ENTROPY_TOO_LOW',
  SECURE_PASSWORD_COMMON_PASSWORD: 'SECURE_PASSWORD_COMMON_PASSWORD',
  SECURE_PASSWORD_BREACHED_PASSWORD: 'SECURE_PASSWORD_BREACHED_PASSWORD',
  SECURE_PASSWORD_CONTAINS_SPACE: 'SECURE_PASSWORD_CONTAINS_SPACE',
  
  // 프로필 이름 에러
  PROFILE_NAME_FIELD_EMPTY: 'PROFILE_NAME_FIELD_EMPTY',
  PROFILE_NAME_LENGTH_TOO_SHORT: 'PROFILE_NAME_LENGTH_TOO_SHORT',
  PROFILE_NAME_LENGTH_TOO_LONG: 'PROFILE_NAME_LENGTH_TOO_LONG',
  PROFILE_NAME_INVALID_CHARACTERS: 'PROFILE_NAME_INVALID_CHARACTERS',
  PROFILE_NAME_HTML_TAGS_DETECTED: 'PROFILE_NAME_HTML_TAGS_DETECTED',
  PROFILE_NAME_SQL_KEYWORDS_DETECTED: 'PROFILE_NAME_SQL_KEYWORDS_DETECTED',
  PROFILE_NAME_EMOJI_NOT_ALLOWED: 'PROFILE_NAME_EMOJI_NOT_ALLOWED',
  PROFILE_NAME_CONTROL_CHARS_DETECTED: 'PROFILE_NAME_CONTROL_CHARS_DETECTED',
  PROFILE_NAME_XSS_PATTERN_DETECTED: 'PROFILE_NAME_XSS_PATTERN_DETECTED',
  PROFILE_NAME_PATH_TRAVERSAL_DETECTED: 'PROFILE_NAME_PATH_TRAVERSAL_DETECTED'
} as const;

/**
 * 한국어 에러 메시지 맵
 */
export const ClientAuthValidationErrorMessagesKO: Record<string, string> = {
  // 등록 이메일 에러 메시지
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FIELD_EMPTY]: '이메일을 입력해주세요',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FORMAT_INVALID]: '올바른 이메일 형식이 아닙니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_LENGTH_TOO_SHORT]: '이메일은 최소 3자 이상이어야 합니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_LENGTH_TOO_LONG]: '이메일은 최대 254자까지 가능합니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_DISPOSABLE_BLOCKED]: '일회용 이메일은 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_DANGEROUS_PATTERN]: '보안상 허용되지 않는 문자가 포함되어 있습니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_ALREADY_EXISTS]: '이미 등록된 이메일입니다',
  [ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_DNS_INVALID]: '유효하지 않은 이메일 도메인입니다',
  
  // 보안 비밀번호 에러 메시지 (백엔드와 동기화)
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_FIELD_EMPTY]: '비밀번호를 입력해주세요',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_LENGTH_TOO_SHORT]: '비밀번호는 8자 이상이어야 합니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_LENGTH_TOO_LONG]: '비밀번호는 최대 128자까지 가능합니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_CHAR_TYPES_INSUFFICIENT]: '대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_SEQUENTIAL_PATTERN]: '연속된 문자나 숫자를 4개 이상 사용할 수 없습니다 (예: abcd, 1234)',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_REPEATED_PATTERN]: '같은 문자를 3번 이상 연속으로 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_PERSONAL_INFO_INCLUDED]: '비밀번호에 이메일이나 이름이 포함될 수 없습니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_ENTROPY_TOO_LOW]: '비밀번호가 너무 예측 가능합니다. 더 복잡한 조합을 사용하세요',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_COMMON_PASSWORD]: '너무 일반적이거나 예측 가능한 비밀번호입니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_BREACHED_PASSWORD]: '유출된 비밀번호 목록에 있는 비밀번호입니다',
  [ClientAuthValidationErrorCodes.SECURE_PASSWORD_CONTAINS_SPACE]: '비밀번호에 공백을 포함할 수 없습니다',
  
  // 프로필 이름 에러 메시지
  [ClientAuthValidationErrorCodes.PROFILE_NAME_FIELD_EMPTY]: '이름을 입력해주세요',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_LENGTH_TOO_SHORT]: '이름은 최소 2자 이상이어야 합니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_LENGTH_TOO_LONG]: '이름은 최대 50자까지 가능합니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_INVALID_CHARACTERS]: '사용할 수 없는 문자가 포함되어 있습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_HTML_TAGS_DETECTED]: 'HTML 태그는 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_SQL_KEYWORDS_DETECTED]: 'SQL 키워드는 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_EMOJI_NOT_ALLOWED]: '이모지는 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_CONTROL_CHARS_DETECTED]: '제어 문자는 사용할 수 없습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_XSS_PATTERN_DETECTED]: 'XSS 공격 패턴이 감지되었습니다',
  [ClientAuthValidationErrorCodes.PROFILE_NAME_PATH_TRAVERSAL_DETECTED]: '경로 탐색 패턴이 감지되었습니다'
};

/**
 * 타입 가드 함수들
 */
export function isClientAuthFieldError(obj: any): obj is ClientAuthFieldError {
  return obj && 
    typeof obj.errorCode === 'string' && 
    typeof obj.errorMessage === 'string' &&
    typeof obj.fieldName === 'string';
}

export function hasClientAuthErrors(result: ClientAuthFormValidationResult): boolean {
  return result.fieldErrors.length > 0;
}

export function hasClientAuthWarnings(result: ClientAuthFormValidationResult): boolean {
  return (result.fieldWarnings?.length ?? 0) > 0;
}

export function getClientAuthErrorsByField(
  result: ClientAuthFormValidationResult, 
  fieldName: ClientAuthFieldError['fieldName']
): ClientAuthFieldError[] {
  return result.fieldErrors.filter(error => error.fieldName === fieldName);
}

export type ClientAuthValidationErrorCode = typeof ClientAuthValidationErrorCodes[keyof typeof ClientAuthValidationErrorCodes];