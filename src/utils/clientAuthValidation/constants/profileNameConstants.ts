/**
 * Profile Name Validation Constants
 * 
 * 프로필 이름 검증을 위한 상수 정의
 * 백엔드 NameValidationService와 동기화
 */

/**
 * 프로필 이름 길이 제한
 */
export const PROFILE_NAME_LENGTH_BOUNDARIES = {
  ABSOLUTE_MIN: 2,
  RECOMMENDED_MIN: 3,
  ABSOLUTE_MAX: 50,
  RECOMMENDED_MAX: 30,
  DISPLAY_NAME_MAX: 20  // UI 표시용 최대 길이
} as const;

/**
 * 허용된 문자 패턴
 */
export const PROFILE_NAME_ALLOWED_PATTERNS = {
  // 기본 허용 문자
  KOREAN: /[가-힣]/,
  ENGLISH: /[a-zA-Z]/,
  NUMBERS: /[0-9]/,
  BASIC_SPACE: /\s/,
  
  // 특수 허용 문자 (선택적)
  DOT: /\./,
  HYPHEN: /-/,
  APOSTROPHE: /'/,
  UNDERSCORE: /_/,
  
  // 전체 허용 패턴 (백엔드와 동일)
  FULL_PATTERN: /^[가-힣a-zA-Z0-9\s.\-']+$/,
  
  // 엄격한 패턴 (특수문자 제외)
  STRICT_PATTERN: /^[가-힣a-zA-Z0-9\s]+$/
} as const;

/**
 * 금지된 HTML 태그 패턴
 */
export const PROFILE_NAME_BLOCKED_HTML_TAGS = [
  // 스크립트 태그
  '<script',
  '</script>',
  '<javascript',
  
  // 이벤트 핸들러
  'onclick',
  'onerror',
  'onload',
  'onmouseover',
  'onfocus',
  'onblur',
  'onchange',
  
  // iframe/embed
  '<iframe',
  '<embed',
  '<object',
  '<applet',
  
  // 링크/이미지
  '<a ',
  '<img',
  '<link',
  
  // 스타일
  '<style',
  '</style>',
  
  // 기타 위험 태그
  '<meta',
  '<base',
  '<form',
  '<input',
  '<textarea',
  '<button',
  '<select'
] as const;

/**
 * SQL Injection 키워드
 */
export const PROFILE_NAME_SQL_KEYWORDS = [
  // DML
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'MERGE',
  
  // DDL
  'CREATE',
  'ALTER',
  'DROP',
  'TRUNCATE',
  
  // DCL
  'GRANT',
  'REVOKE',
  
  // TCL
  'COMMIT',
  'ROLLBACK',
  'SAVEPOINT',
  
  // 기타 위험 키워드
  'UNION',
  'JOIN',
  'WHERE',
  'HAVING',
  'ORDER BY',
  'GROUP BY',
  'EXEC',
  'EXECUTE',
  'CAST',
  'CONVERT',
  
  // 주석
  '--',
  '/*',
  '*/',
  
  // 특수 문자 조합
  'OR 1=1',
  'AND 1=1',
  '\' OR \'',
  '" OR "',
  '1=1',
  '\'=\''
] as const;

/**
 * XSS 공격 패턴
 */
export const PROFILE_NAME_XSS_PATTERNS = [
  // JavaScript 실행
  'javascript:',
  'data:text/html',
  'vbscript:',
  'file://',
  
  // 인코딩된 스크립트
  '%3Cscript',
  '&#60;script',
  '\\x3cscript',
  '\\u003cscript',
  
  // Expression
  'expression(',
  'eval(',
  'alert(',
  'confirm(',
  'prompt(',
  'console.',
  'window.',
  'document.',
  
  // 기타 위험 패턴
  'String.fromCharCode',
  'atob(',
  'btoa(',
  'fetch(',
  'XMLHttpRequest'
] as const;

/**
 * Path Traversal 패턴
 */
export const PROFILE_NAME_PATH_TRAVERSAL_PATTERNS = [
  '../',
  '..\\',
  '..%2f',
  '..%2F',
  '..%5c',
  '..%5C',
  '%2e%2e%2f',
  '%2e%2e/',
  '..;/',
  '..//',
  '..\\..',
  './../'
] as const;

/**
 * 제어 문자 및 특수 유니코드
 */
export const PROFILE_NAME_CONTROL_CHARACTERS = {
  // NULL 문자
  NULL_CHARS: ['\0', '\x00', '\u0000', '%00'],
  
  // 줄바꿈 문자
  NEWLINE_CHARS: ['\n', '\r', '\r\n', '%0a', '%0d', '%0d%0a'],
  
  // 탭 문자
  TAB_CHARS: ['\t', '%09'],
  
  // 백스페이스
  BACKSPACE_CHARS: ['\b', '\x08'],
  
  // Zero Width 문자
  ZERO_WIDTH_CHARS: [
    '\u200b', // Zero Width Space
    '\u200c', // Zero Width Non-Joiner
    '\u200d', // Zero Width Joiner
    '\ufeff', // Zero Width No-Break Space
    '\u2060'  // Word Joiner
  ],
  
  // Right-to-Left Override
  RTL_CHARS: ['\u202e', '\u202d', '\u202c']
} as const;

/**
 * 이모지 감지 패턴 (ES5 호환)
 * Unicode surrogate pairs를 사용하여 이모지 감지
 */
export const PROFILE_NAME_EMOJI_PATTERNS = {
  // 이모티콘 범위 (😀-🙏)
  EMOTICONS: /[\uD83D][\uDE00-\uDE4F]/g,
  
  // 기호 및 픽토그램 (🌀-🗿)
  SYMBOLS: /[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDDFF]/g,
  
  // 교통 및 지도 기호 (🚀-🛿)
  TRANSPORT: /[\uD83D][\uDE80-\uDEFF]/g,
  
  // 추가 이모티콘 (🤀-🧿)
  SUPPLEMENTAL: /[\uD83E][\uDD00-\uDDFF]/g,
  
  // 기타 이모지 (☀-⛿, ✀-➿)
  MISC: /[\u2600-\u26FF]|[\u2700-\u27BF]/g,
  
  // 전체 이모지 패턴 (ES5 호환 - surrogate pairs 사용)
  ALL_EMOJI: /(?:[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]|[\uD83D][\uDE80-\uDEFF]|[\uD83E][\uDD00-\uDDFF])/g
} as const;

/**
 * 언어별 특수 규칙
 */
export const PROFILE_NAME_LANGUAGE_RULES = {
  KOREAN: {
    minLength: 2,
    maxLength: 10,
    pattern: /^[가-힣\s]+$/,
    message: '한글과 공백만 사용 가능합니다'
  },
  ENGLISH: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z\s.\-']+$/,
    message: '영문, 공백, 점, 하이픈, 어포스트로피만 사용 가능합니다'
  },
  MIXED: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[가-힣a-zA-Z0-9\s.\-']+$/,
    message: '한글, 영문, 숫자와 일부 특수문자만 사용 가능합니다'
  }
} as const;

/**
 * 프로필 이름 검증 메시지
 */
export const PROFILE_NAME_VALIDATION_MESSAGES = {
  // 필수 입력
  REQUIRED: '이름을 입력해주세요',
  
  // 길이 관련
  TOO_SHORT: `이름은 최소 ${PROFILE_NAME_LENGTH_BOUNDARIES.ABSOLUTE_MIN}자 이상이어야 합니다`,
  TOO_LONG: `이름은 최대 ${PROFILE_NAME_LENGTH_BOUNDARIES.ABSOLUTE_MAX}자까지 가능합니다`,
  
  // 문자 관련
  INVALID_CHARS: '사용할 수 없는 문자가 포함되어 있습니다',
  ONLY_SPACES: '공백만으로는 이름을 만들 수 없습니다',
  
  // 보안 관련
  HTML_DETECTED: 'HTML 태그는 사용할 수 없습니다',
  SQL_DETECTED: 'SQL 키워드는 사용할 수 없습니다',
  XSS_DETECTED: '보안상 허용되지 않는 패턴이 감지되었습니다',
  PATH_TRAVERSAL_DETECTED: '경로 탐색 패턴이 감지되었습니다',
  
  // 특수 문자 관련
  EMOJI_NOT_ALLOWED: '이모지는 사용할 수 없습니다',
  CONTROL_CHARS_DETECTED: '제어 문자는 사용할 수 없습니다',
  
  // 성공
  VALID_NAME: '사용 가능한 이름입니다'
} as const;

/**
 * 이름 정규화 규칙
 */
export const PROFILE_NAME_NORMALIZATION_RULES = {
  // 공백 정규화
  TRIM_SPACES: true,
  COLLAPSE_SPACES: true,  // 연속 공백을 하나로
  
  // 대소문자 정규화
  PRESERVE_CASE: true,    // 원본 대소문자 유지
  
  // 유니코드 정규화
  UNICODE_NORMALIZATION: 'NFC' as const  // NFC, NFD, NFKC, NFKD
};