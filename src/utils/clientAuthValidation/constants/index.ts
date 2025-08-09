/**
 * Client Authentication Validation Constants
 * 
 * 모든 검증 관련 상수를 중앙에서 관리
 */

// 등록 이메일 관련 상수
export * from './registrationEmailConstants';

// 보안 비밀번호 관련 상수
export * from './securePasswordConstants';

// 프로필 이름 관련 상수
export * from './profileNameConstants';

/**
 * 전역 검증 설정
 */
export const GLOBAL_VALIDATION_CONFIG = {
  // 디바운싱 설정
  DEBOUNCE_DELAY_MS: 300,
  
  // 비동기 검증 타임아웃
  ASYNC_VALIDATION_TIMEOUT_MS: 5000,
  
  // 재시도 설정
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  
  // 캐시 설정
  VALIDATION_CACHE_TTL_MS: 60000, // 1분
  
  // 성능 임계값
  MAX_VALIDATION_TIME_MS: 100
} as const;