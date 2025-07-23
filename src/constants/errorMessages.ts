/**
 * 서버 에러 코드를 한국어 메시지로 매핑
 * Backend error codes from gateway and user-service
 */

// 에러 코드별 한국어 메시지 매핑
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Authentication & Authorization Errors (1000-1999)
  'AUTH-1001': '이메일 또는 비밀번호가 올바르지 않습니다',
  'AUTH-1002': '인증 토큰이 만료되었습니다. 다시 로그인해주세요',
  'AUTH-1003': '유효하지 않은 인증 토큰입니다',
  'AUTH-1004': '요청한 리소스에 접근할 수 없습니다',
  'AUTH-1005': '권한이 부족합니다',

  // Validation Errors (2000-2999)
  'VAL-2001': '입력값 검증에 실패했습니다',
  'VAL-2002': '올바르지 않은 입력 형식입니다',
  'VAL-2003': '필수 입력 항목이 누락되었습니다',
  'VAL-2004': '입력값이 허용 범위를 벗어났습니다',
  'VAL-2005': '이미 등록된 이메일입니다',

  // Business Logic Errors (3000-3999)
  'BIZ-3001': '요청한 정보를 찾을 수 없습니다',
  'BIZ-3002': '현재 상태에서는 해당 작업을 수행할 수 없습니다',
  'BIZ-3003': '비즈니스 규칙 위반입니다',

  // System Errors (5000-5999)
  'SYS-5001': '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  'SYS-5002': '데이터베이스 작업에 실패했습니다'
};

// 영어 메시지를 한국어로 매핑 (에러 코드가 없는 경우를 위한 폴백)
export const ERROR_MESSAGE_TRANSLATIONS: Record<string, string> = {
  // Authentication related
  'Invalid username or password': '이메일 또는 비밀번호가 올바르지 않습니다',
  'User account is disabled': '비활성화된 계정입니다',
  'Token has been revoked': '토큰이 취소되었습니다',
  'Token expired': '인증이 만료되었습니다. 다시 로그인해주세요',
  'Invalid token': '유효하지 않은 인증입니다',
  'Token validation failed': '인증 검증에 실패했습니다',
  'User not found': '사용자를 찾을 수 없습니다',
  'Invalid refresh token': '유효하지 않은 갱신 토큰입니다',
  'Token is not a refresh token': '올바른 토큰 타입이 아닙니다',
  'Missing authorization header': '인증 정보가 없습니다',
  
  // Registration related
  'User already exists': '이미 등록된 이메일입니다',
  'Email already registered': '이미 등록된 이메일입니다',
  
  // Validation related
  'Email is required': '이메일은 필수입니다',
  'Password is required': '비밀번호는 필수입니다',
  'Name is required': '이름은 필수입니다',
  'Current password is required': '현재 비밀번호는 필수입니다',
  'New password is required': '새 비밀번호는 필수입니다',
  
  // Network errors
  'Network Error': '네트워크 연결을 확인해주세요',
  'Request failed with status code 500': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  'Request failed with status code 404': '요청한 정보를 찾을 수 없습니다',
  'Request failed with status code 403': '접근 권한이 없습니다',
  'Request failed with status code 401': '인증이 필요합니다. 다시 로그인해주세요',
  'Request failed with status code 400': '잘못된 요청입니다'
};

// 키워드 기반 매핑 (더 일반적인 에러 처리)
export const ERROR_KEYWORD_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /already exists?/i, message: '이미 존재합니다' },
  { pattern: /not found/i, message: '찾을 수 없습니다' },
  { pattern: /invalid/i, message: '올바르지 않습니다' },
  { pattern: /required/i, message: '필수 항목입니다' },
  { pattern: /expired/i, message: '만료되었습니다' },
  { pattern: /unauthorized/i, message: '인증이 필요합니다' },
  { pattern: /forbidden/i, message: '접근 권한이 없습니다' },
  { pattern: /failed/i, message: '실패했습니다' },
  { pattern: /timeout/i, message: '요청 시간이 초과되었습니다' },
  { pattern: /duplicate/i, message: '중복된 값입니다' }
];

/**
 * 에러 메시지를 사용자 친화적인 한국어 메시지로 변환
 */
export function translateErrorMessage(errorCode?: string, errorMessage?: string): string {
  // 1. 에러 코드로 매핑 시도
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    return ERROR_CODE_MESSAGES[errorCode];
  }

  // 2. 정확한 메시지 매칭 시도
  if (errorMessage && ERROR_MESSAGE_TRANSLATIONS[errorMessage]) {
    return ERROR_MESSAGE_TRANSLATIONS[errorMessage];
  }

  // 3. 키워드 패턴 매칭 시도
  if (errorMessage) {
    for (const { pattern, message } of ERROR_KEYWORD_PATTERNS) {
      if (pattern.test(errorMessage)) {
        return message;
      }
    }
  }

  // 4. 기본 에러 메시지
  return errorMessage || '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
}