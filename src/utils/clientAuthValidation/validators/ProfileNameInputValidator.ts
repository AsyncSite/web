/**
 * Profile Name Input Validator
 * 
 * 프로필 이름 클라이언트 측 검증기
 * 백엔드 NameValidationService와 동기화된 검증 로직
 */

import {
  ClientAuthFormValidationResult,
  ClientAuthFieldError,
  ClientAuthFieldWarning,
  ClientAuthValidationErrorCodes,
  ClientAuthValidationErrorMessagesKO,
  RealtimeValidationOptions
} from '../types';

import {
  PROFILE_NAME_LENGTH_BOUNDARIES,
  PROFILE_NAME_ALLOWED_PATTERNS,
  PROFILE_NAME_BLOCKED_HTML_TAGS,
  PROFILE_NAME_SQL_KEYWORDS,
  PROFILE_NAME_XSS_PATTERNS,
  PROFILE_NAME_PATH_TRAVERSAL_PATTERNS,
  PROFILE_NAME_CONTROL_CHARACTERS,
  PROFILE_NAME_EMOJI_PATTERNS,
  PROFILE_NAME_LANGUAGE_RULES,
  PROFILE_NAME_NORMALIZATION_RULES
} from '../constants';

/**
 * 프로필 이름 검증 클래스
 */
export class ProfileNameInputValidator {
  private static instance: ProfileNameInputValidator;

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ProfileNameInputValidator {
    if (!ProfileNameInputValidator.instance) {
      ProfileNameInputValidator.instance = new ProfileNameInputValidator();
    }
    return ProfileNameInputValidator.instance;
  }

  /**
   * 프로필 이름 검증 메인 함수
   */
  public validateProfileName(
    name: string,
    options?: RealtimeValidationOptions
  ): ClientAuthFormValidationResult {
    const startTime = performance.now();
    
    const errors: ClientAuthFieldError[] = [];
    const warnings: ClientAuthFieldWarning[] = [];

    // 정규화
    const normalizedName = this.normalizeName(name);
    
    // 1. 필수 입력 검증
    if (!normalizedName) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_FIELD_EMPTY,
        'critical'
      ));
      return this.createResult(errors, warnings, startTime);
    }

    // 2. 공백만 있는지 검사
    if (normalizedName.trim().length === 0) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_INVALID_CHARACTERS,
        'major',
        { violatedRule: 'Only whitespace' }
      ));
      return this.createResult(errors, warnings, startTime);
    }

    // 3. 길이 검증
    const lengthValidation = this.validateNameLength(normalizedName);
    if (lengthValidation) {
      errors.push(lengthValidation);
    }

    // 4. 문자 검증
    const charValidation = this.validateCharacters(normalizedName, options);
    if (charValidation) {
      errors.push(charValidation);
    }

    // 5. HTML 태그 검사
    const htmlValidation = this.checkHtmlTags(normalizedName);
    if (htmlValidation) {
      errors.push(htmlValidation);
    }

    // 6. SQL Injection 검사
    const sqlValidation = this.checkSqlInjection(normalizedName);
    if (sqlValidation) {
      errors.push(sqlValidation);
    }

    // 7. XSS 패턴 검사
    const xssValidation = this.checkXssPatterns(normalizedName);
    if (xssValidation) {
      errors.push(xssValidation);
    }

    // 8. Path Traversal 검사
    const pathValidation = this.checkPathTraversal(normalizedName);
    if (pathValidation) {
      errors.push(pathValidation);
    }

    // 9. 제어 문자 검사
    const controlCharValidation = this.checkControlCharacters(normalizedName);
    if (controlCharValidation) {
      errors.push(controlCharValidation);
    }

    // 10. 이모지 검사
    if (options?.profileNameOptions?.allowEmojis === false) {
      const emojiValidation = this.checkEmoji(normalizedName);
      if (emojiValidation) {
        errors.push(emojiValidation);
      }
    }

    // 11. 언어별 규칙 검사 및 경고
    const languageWarnings = this.checkLanguageSpecificRules(normalizedName);
    warnings.push(...languageWarnings);

    // 12. 의심스러운 패턴 경고
    const suspiciousPatterns = this.detectSuspiciousPatterns(normalizedName);
    if (suspiciousPatterns.length > 0) {
      warnings.push({
        warningCode: 'SUSPICIOUS_PATTERNS',
        warningMessage: '의심스러운 패턴이 감지되었습니다',
        improvementSuggestion: '더 일반적인 이름 형식을 사용하세요',
        securityRiskLevel: 'medium'
      });
    }

    // 결과 생성
    const sanitizedName = this.sanitizeName(normalizedName);
    const detectedLanguages = this.detectLanguages(normalizedName);

    return this.createResult(errors, warnings, startTime, {
      sanitizedValue: sanitizedName !== normalizedName ? sanitizedName : undefined,
      detectedLanguages: detectedLanguages.length > 0 ? detectedLanguages : undefined,
      suspiciousPatterns: suspiciousPatterns.length > 0 ? suspiciousPatterns : undefined
    });
  }

  /**
   * 이름 정규화
   */
  private normalizeName(name: string): string {
    let normalized = name;

    // 앞뒤 공백 제거
    if (PROFILE_NAME_NORMALIZATION_RULES.TRIM_SPACES) {
      normalized = normalized.trim();
    }

    // 연속 공백을 하나로
    if (PROFILE_NAME_NORMALIZATION_RULES.COLLAPSE_SPACES) {
      normalized = normalized.replace(/\s+/g, ' ');
    }

    // 유니코드 정규화
    if (typeof normalized.normalize === 'function') {
      normalized = normalized.normalize(PROFILE_NAME_NORMALIZATION_RULES.UNICODE_NORMALIZATION);
    }

    return normalized;
  }

  /**
   * 길이 검증
   */
  private validateNameLength(name: string): ClientAuthFieldError | null {
    if (name.length < PROFILE_NAME_LENGTH_BOUNDARIES.ABSOLUTE_MIN) {
      return this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_LENGTH_TOO_SHORT,
        'major'
      );
    }

    if (name.length > PROFILE_NAME_LENGTH_BOUNDARIES.ABSOLUTE_MAX) {
      return this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_LENGTH_TOO_LONG,
        'major'
      );
    }

    return null;
  }

  /**
   * 문자 검증
   */
  private validateCharacters(
    name: string,
    options?: RealtimeValidationOptions
  ): ClientAuthFieldError | null {
    // 유니코드 허용 여부
    if (options?.profileNameOptions?.allowUnicodeChars === false) {
      // ASCII만 허용
      if (!/^[\x00-\x7F]+$/.test(name)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_INVALID_CHARACTERS,
          'major',
          { violatedRule: 'Non-ASCII characters' }
        );
      }
    }

    // 기본 패턴 검증
    const pattern = options?.profileNameOptions?.allowSpecialSymbols
      ? PROFILE_NAME_ALLOWED_PATTERNS.FULL_PATTERN
      : PROFILE_NAME_ALLOWED_PATTERNS.STRICT_PATTERN;

    if (!pattern.test(name)) {
      return this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_INVALID_CHARACTERS,
        'major',
        { expectedFormat: '한글, 영문, 숫자와 일부 특수문자' }
      );
    }

    return null;
  }

  /**
   * HTML 태그 검사
   */
  private checkHtmlTags(name: string): ClientAuthFieldError | null {
    const lowerName = name.toLowerCase();

    for (const tag of PROFILE_NAME_BLOCKED_HTML_TAGS) {
      if (lowerName.includes(tag.toLowerCase())) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_HTML_TAGS_DETECTED,
          'critical',
          { violatedRule: `Contains HTML: ${tag}` }
        );
      }
    }

    // 일반적인 HTML 태그 패턴
    if (/<[^>]+>/.test(name)) {
      return this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_HTML_TAGS_DETECTED,
        'critical'
      );
    }

    return null;
  }

  /**
   * SQL Injection 검사
   */
  private checkSqlInjection(name: string): ClientAuthFieldError | null {
    const upperName = name.toUpperCase();

    for (const keyword of PROFILE_NAME_SQL_KEYWORDS) {
      // 모든 키워드를 직접 문자열 비교로 체크 (정규표현식 사용 안함)
      if (upperName.includes(keyword)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_SQL_KEYWORDS_DETECTED,
          'critical',
          { violatedRule: `Contains SQL: ${keyword}` }
        );
      }
    }

    return null;
  }

  /**
   * XSS 패턴 검사
   */
  private checkXssPatterns(name: string): ClientAuthFieldError | null {
    const lowerName = name.toLowerCase();

    for (const pattern of PROFILE_NAME_XSS_PATTERNS) {
      if (lowerName.includes(pattern.toLowerCase())) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_XSS_PATTERN_DETECTED,
          'critical',
          { violatedRule: `XSS pattern: ${pattern}` }
        );
      }
    }

    return null;
  }

  /**
   * Path Traversal 검사
   */
  private checkPathTraversal(name: string): ClientAuthFieldError | null {
    for (const pattern of PROFILE_NAME_PATH_TRAVERSAL_PATTERNS) {
      if (name.includes(pattern)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_PATH_TRAVERSAL_DETECTED,
          'critical',
          { violatedRule: `Path traversal: ${pattern}` }
        );
      }
    }

    return null;
  }

  /**
   * 제어 문자 검사
   */
  private checkControlCharacters(name: string): ClientAuthFieldError | null {
    // NULL 문자
    for (const nullChar of PROFILE_NAME_CONTROL_CHARACTERS.NULL_CHARS) {
      if (name.includes(nullChar)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_CONTROL_CHARS_DETECTED,
          'major',
          { violatedRule: 'NULL character' }
        );
      }
    }

    // 줄바꿈 문자
    for (const newlineChar of PROFILE_NAME_CONTROL_CHARACTERS.NEWLINE_CHARS) {
      if (name.includes(newlineChar)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_CONTROL_CHARS_DETECTED,
          'major',
          { violatedRule: 'Newline character' }
        );
      }
    }

    // Zero Width 문자
    for (const zeroWidthChar of PROFILE_NAME_CONTROL_CHARACTERS.ZERO_WIDTH_CHARS) {
      if (name.includes(zeroWidthChar)) {
        return this.createError(
          ClientAuthValidationErrorCodes.PROFILE_NAME_CONTROL_CHARS_DETECTED,
          'major',
          { violatedRule: 'Zero-width character' }
        );
      }
    }

    return null;
  }

  /**
   * 이모지 검사
   */
  private checkEmoji(name: string): ClientAuthFieldError | null {
    if (PROFILE_NAME_EMOJI_PATTERNS.ALL_EMOJI.test(name)) {
      return this.createError(
        ClientAuthValidationErrorCodes.PROFILE_NAME_EMOJI_NOT_ALLOWED,
        'minor'
      );
    }

    return null;
  }

  /**
   * 언어별 규칙 검사
   */
  private checkLanguageSpecificRules(name: string): ClientAuthFieldWarning[] {
    const warnings: ClientAuthFieldWarning[] = [];
    const detectedLanguages = this.detectLanguages(name);

    // 혼합 언어 사용 경고
    if (detectedLanguages.length > 1) {
      warnings.push({
        warningCode: 'MIXED_LANGUAGES',
        warningMessage: '여러 언어가 혼합되어 있습니다',
        improvementSuggestion: '일관된 언어를 사용하는 것을 권장합니다',
        securityRiskLevel: 'low'
      });
    }

    // 한글 이름이 너무 긴 경우
    if (detectedLanguages.includes('korean') && 
        name.length > PROFILE_NAME_LANGUAGE_RULES.KOREAN.maxLength) {
      warnings.push({
        warningCode: 'KOREAN_NAME_TOO_LONG',
        warningMessage: '한글 이름이 일반적인 길이를 초과했습니다',
        improvementSuggestion: `한글 이름은 ${PROFILE_NAME_LANGUAGE_RULES.KOREAN.maxLength}자 이내를 권장합니다`,
        securityRiskLevel: 'low'
      });
    }

    return warnings;
  }

  /**
   * 언어 감지
   */
  private detectLanguages(name: string): string[] {
    const languages: string[] = [];

    if (PROFILE_NAME_ALLOWED_PATTERNS.KOREAN.test(name)) {
      languages.push('korean');
    }
    if (PROFILE_NAME_ALLOWED_PATTERNS.ENGLISH.test(name)) {
      languages.push('english');
    }
    if (PROFILE_NAME_ALLOWED_PATTERNS.NUMBERS.test(name)) {
      languages.push('numbers');
    }

    return languages;
  }

  /**
   * 의심스러운 패턴 감지
   */
  private detectSuspiciousPatterns(name: string): string[] {
    const patterns: string[] = [];

    // 과도한 특수문자
    const specialCharCount = (name.match(/[^가-힣a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > 3) {
      patterns.push('Excessive special characters');
    }

    // 숫자로만 구성
    if (/^\d+$/.test(name)) {
      patterns.push('Numbers only');
    }

    // 반복 패턴
    if (/(.)\1{4,}/.test(name)) {
      patterns.push('Repeated characters');
    }

    // URL 패턴
    if (/https?:\/\/|www\./i.test(name)) {
      patterns.push('URL pattern');
    }

    // 이메일 패턴
    if (/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(name)) {
      patterns.push('Email pattern');
    }

    return patterns;
  }

  /**
   * 이름 살균화 (위험 요소 제거)
   */
  private sanitizeName(name: string): string {
    let sanitized = name;

    // HTML 엔티티 이스케이프
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // 제어 문자 제거
    PROFILE_NAME_CONTROL_CHARACTERS.NULL_CHARS.forEach(char => {
      sanitized = sanitized.replace(new RegExp(char, 'g'), '');
    });
    PROFILE_NAME_CONTROL_CHARACTERS.ZERO_WIDTH_CHARS.forEach(char => {
      sanitized = sanitized.replace(new RegExp(char, 'g'), '');
    });

    return sanitized;
  }

  /**
   * 에러 생성 헬퍼
   */
  private createError(
    errorCode: string,
    severity: ClientAuthFieldError['errorSeverity'],
    details?: ClientAuthFieldError['errorDetails']
  ): ClientAuthFieldError {
    return {
      errorCode,
      errorMessage: ClientAuthValidationErrorMessagesKO[errorCode] || '알 수 없는 오류',
      fieldName: 'profileName',
      errorSeverity: severity,
      errorDetails: details
    };
  }

  /**
   * 결과 생성 헬퍼
   */
  private createResult(
    errors: ClientAuthFieldError[],
    warnings: ClientAuthFieldWarning[],
    startTime: number,
    nameMetrics?: any
  ): ClientAuthFormValidationResult {
    const endTime = performance.now();
    
    return {
      isValid: errors.length === 0,
      fieldErrors: errors,
      fieldWarnings: warnings,
      enhancedMetadata: nameMetrics ? {
        profileNameMetrics: nameMetrics
      } : undefined,
      performanceMetrics: {
        validationTimeMs: endTime - startTime,
        asyncChecksCompleted: false
      }
    };
  }
}

// 편의를 위한 export
export const profileNameValidator = ProfileNameInputValidator.getInstance();