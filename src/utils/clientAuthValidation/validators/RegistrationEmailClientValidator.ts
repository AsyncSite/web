/**
 * Registration Email Client-side Validator
 * 
 * 회원가입 이메일 클라이언트 측 검증기
 * 백엔드 EmailValidationService와 동기화된 검증 로직
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
  REGISTRATION_EMAIL_RFC5322_REGEX,
  REGISTRATION_EMAIL_BASIC_REGEX,
  REGISTRATION_EMAIL_LENGTH_CONSTRAINTS,
  DISPOSABLE_EMAIL_DOMAIN_BLACKLIST,
  REGISTRATION_EMAIL_DANGEROUS_PATTERNS,
  REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS,
  REGISTRATION_EMAIL_DOMAIN_SPECIFIC_RULES,
  RegistrationEmailValidationLevel
} from '../constants';

/**
 * 등록 이메일 검증 클래스
 */
export class RegistrationEmailClientValidator {
  private static instance: RegistrationEmailClientValidator;
  private validationCache: Map<string, ClientAuthFormValidationResult>;
  private cacheExpiryTime: number = 60000; // 1분

  private constructor() {
    this.validationCache = new Map();
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): RegistrationEmailClientValidator {
    if (!RegistrationEmailClientValidator.instance) {
      RegistrationEmailClientValidator.instance = new RegistrationEmailClientValidator();
    }
    return RegistrationEmailClientValidator.instance;
  }

  /**
   * 이메일 검증 메인 함수
   */
  public validateRegistrationEmail(
    email: string,
    options?: RealtimeValidationOptions
  ): ClientAuthFormValidationResult {
    const startTime = performance.now();
    
    // 캐시 확인
    const cacheKey = this.generateCacheKey(email, options);
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const errors: ClientAuthFieldError[] = [];
    const warnings: ClientAuthFieldWarning[] = [];
    
    // 정규화
    const normalizedEmail = this.normalizeEmail(email);
    
    // 1. 필수 입력 검증
    if (!normalizedEmail) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FIELD_EMPTY,
        'critical'
      ));
      return this.createResult(errors, warnings, startTime);
    }

    // 2. 길이 검증
    const lengthValidation = this.validateEmailLength(normalizedEmail);
    if (lengthValidation) {
      errors.push(lengthValidation);
      return this.createResult(errors, warnings, startTime);
    }

    // 3. 형식 검증
    const formatValidation = this.validateEmailFormat(normalizedEmail, options);
    if (formatValidation) {
      errors.push(formatValidation);
      return this.createResult(errors, warnings, startTime);
    }

    // 4. 도메인 추출
    const emailParts = this.parseEmail(normalizedEmail);
    if (!emailParts) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FORMAT_INVALID,
        'major'
      ));
      return this.createResult(errors, warnings, startTime);
    }

    // 5. 일회용 이메일 검증
    if (options?.registrationEmailOptions?.blockDisposableEmails !== false) {
      const disposableCheck = this.checkDisposableEmail(emailParts.domain);
      if (disposableCheck) {
        errors.push(disposableCheck);
      }
    }

    // 6. 위험 패턴 검증
    const dangerousPatterns = this.checkDangerousPatterns(normalizedEmail);
    if (dangerousPatterns.length > 0) {
      errors.push(...dangerousPatterns);
    }

    // 7. 의심스러운 패턴 경고
    const suspiciousWarnings = this.checkSuspiciousPatterns(normalizedEmail);
    if (suspiciousWarnings.length > 0) {
      warnings.push(...suspiciousWarnings);
    }

    // 8. Plus addressing 검증 (Gmail 등)
    if (options?.registrationEmailOptions?.allowPlusAddressing === false) {
      if (emailParts.localPart.includes('+')) {
        warnings.push({
          warningCode: 'PLUS_ADDRESSING_DETECTED',
          warningMessage: 'Plus addressing이 감지되었습니다',
          improvementSuggestion: '기본 이메일 주소를 사용해주세요',
          securityRiskLevel: 'low'
        });
      }
    }

    // 결과 생성 및 캐싱
    const result = this.createResult(errors, warnings, startTime, {
      domainName: emailParts.domain,
      isDisposableEmailProvider: this.isDisposableDomain(emailParts.domain),
      emailRiskScore: this.calculateRiskScore(normalizedEmail, emailParts)
    });

    this.setCachedResult(cacheKey, result);
    return result;
  }

  /**
   * 이메일 정규화
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * 이메일 파싱
   */
  private parseEmail(email: string): { localPart: string; domain: string } | null {
    const parts = email.split('@');
    if (parts.length !== 2) {
      return null;
    }
    
    return {
      localPart: parts[0],
      domain: parts[1]
    };
  }

  /**
   * 길이 검증
   */
  private validateEmailLength(email: string): ClientAuthFieldError | null {
    if (email.length < REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.MIN_LENGTH) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_LENGTH_TOO_SHORT,
        'major'
      );
    }

    if (email.length > REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.MAX_LENGTH) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_LENGTH_TOO_LONG,
        'major'
      );
    }

    // Local part 길이 검증
    const atIndex = email.indexOf('@');
    if (atIndex > REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.LOCAL_PART_MAX_LENGTH) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FORMAT_INVALID,
        'major',
        { violatedRule: 'Local part too long' }
      );
    }

    // Domain part 길이 검증
    const domainLength = email.length - atIndex - 1;
    if (domainLength > REGISTRATION_EMAIL_LENGTH_CONSTRAINTS.DOMAIN_PART_MAX_LENGTH) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FORMAT_INVALID,
        'major',
        { violatedRule: 'Domain part too long' }
      );
    }

    return null;
  }

  /**
   * 형식 검증
   */
  private validateEmailFormat(
    email: string,
    options?: RealtimeValidationOptions
  ): ClientAuthFieldError | null {
    // 기본 또는 RFC5322 정규식 선택
    const regex = options?.registrationEmailOptions?.skipDNSVerification
      ? REGISTRATION_EMAIL_BASIC_REGEX
      : REGISTRATION_EMAIL_RFC5322_REGEX;

    if (!regex.test(email)) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_FORMAT_INVALID,
        'major',
        { expectedFormat: 'user@domain.com' }
      );
    }

    return null;
  }

  /**
   * 일회용 이메일 도메인 검증
   */
  private checkDisposableEmail(domain: string): ClientAuthFieldError | null {
    if (this.isDisposableDomain(domain)) {
      return this.createError(
        ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_DISPOSABLE_BLOCKED,
        'major',
        { rejectedValue: domain }
      );
    }
    return null;
  }

  /**
   * 일회용 도메인 확인
   */
  private isDisposableDomain(domain: string): boolean {
    const lowerDomain = domain.toLowerCase();
    
    // 정확한 매칭
    if (DISPOSABLE_EMAIL_DOMAIN_BLACKLIST.includes(lowerDomain as any)) {
      return true;
    }

    // 서브도메인 포함 확인
    for (const disposableDomain of DISPOSABLE_EMAIL_DOMAIN_BLACKLIST) {
      if (lowerDomain.endsWith(`.${disposableDomain}`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 위험 패턴 검사
   */
  private checkDangerousPatterns(email: string): ClientAuthFieldError[] {
    const errors: ClientAuthFieldError[] = [];
    const lowerEmail = email.toLowerCase();

    for (const pattern of REGISTRATION_EMAIL_DANGEROUS_PATTERNS) {
      if (lowerEmail.includes(pattern.toLowerCase())) {
        errors.push(this.createError(
          ClientAuthValidationErrorCodes.REGISTRATION_EMAIL_DANGEROUS_PATTERN,
          'critical',
          { violatedRule: `Contains '${pattern}'` }
        ));
        break; // 첫 번째 위험 패턴만 보고
      }
    }

    return errors;
  }

  /**
   * 의심스러운 패턴 검사
   */
  private checkSuspiciousPatterns(email: string): ClientAuthFieldWarning[] {
    const warnings: ClientAuthFieldWarning[] = [];

    // 연속된 점
    if (REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS.CONSECUTIVE_DOTS.test(email)) {
      warnings.push({
        warningCode: 'CONSECUTIVE_DOTS',
        warningMessage: '연속된 점이 포함되어 있습니다',
        improvementSuggestion: '표준 이메일 형식을 사용하세요',
        securityRiskLevel: 'low'
      });
    }

    // 시작/끝 점
    if (REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS.STARTS_OR_ENDS_WITH_DOT.test(email)) {
      warnings.push({
        warningCode: 'DOT_POSITION',
        warningMessage: '점으로 시작하거나 끝나는 이메일입니다',
        improvementSuggestion: '표준 이메일 형식을 사용하세요',
        securityRiskLevel: 'low'
      });
    }

    // 과도한 특수문자
    if (REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS.EXCESSIVE_SPECIAL_CHARS.test(email)) {
      warnings.push({
        warningCode: 'EXCESSIVE_SPECIAL_CHARS',
        warningMessage: '특수문자가 과도하게 사용되었습니다',
        improvementSuggestion: '간단한 이메일 주소를 사용하세요',
        securityRiskLevel: 'medium'
      });
    }

    // 숫자만으로 된 로컬 파트
    if (REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS.NUMERIC_ONLY_LOCAL.test(email)) {
      warnings.push({
        warningCode: 'NUMERIC_ONLY_LOCAL',
        warningMessage: '숫자로만 구성된 이메일 ID입니다',
        improvementSuggestion: '문자를 포함한 이메일 ID를 사용하세요',
        securityRiskLevel: 'low'
      });
    }

    return warnings;
  }

  /**
   * 위험도 점수 계산
   */
  private calculateRiskScore(
    email: string,
    emailParts: { localPart: string; domain: string }
  ): number {
    let score = 0;

    // 일회용 이메일
    if (this.isDisposableDomain(emailParts.domain)) {
      score += 30;
    }

    // 의심스러운 패턴
    Object.values(REGISTRATION_EMAIL_SUSPICIOUS_PATTERNS).forEach(pattern => {
      if (pattern.test(email)) {
        score += 10;
      }
    });

    // 너무 짧은 로컬 파트
    if (emailParts.localPart.length < 3) {
      score += 15;
    }

    // 특수문자 과다
    const specialCharCount = (emailParts.localPart.match(/[^a-zA-Z0-9]/g) || []).length;
    if (specialCharCount > 3) {
      score += 10;
    }

    return Math.min(score, 100); // 최대 100점
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
      fieldName: 'registrationEmail',
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
    emailMetrics?: any
  ): ClientAuthFormValidationResult {
    const endTime = performance.now();
    
    return {
      isValid: errors.length === 0,
      fieldErrors: errors,
      fieldWarnings: warnings,
      enhancedMetadata: emailMetrics ? {
        registrationEmailMetrics: emailMetrics
      } : undefined,
      performanceMetrics: {
        validationTimeMs: endTime - startTime,
        asyncChecksCompleted: false
      }
    };
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(email: string, options?: RealtimeValidationOptions): string {
    return `email:${email}:${JSON.stringify(options || {})}`;
  }

  /**
   * 캐시에서 결과 가져오기
   */
  private getCachedResult(key: string): ClientAuthFormValidationResult | null {
    const cached = this.validationCache.get(key);
    if (cached) {
      const now = Date.now();
      const cacheAge = now - (cached as any).timestamp;
      if (cacheAge < this.cacheExpiryTime) {
        return cached;
      }
      this.validationCache.delete(key);
    }
    return null;
  }

  /**
   * 캐시에 결과 저장
   */
  private setCachedResult(key: string, result: ClientAuthFormValidationResult): void {
    (result as any).timestamp = Date.now();
    this.validationCache.set(key, result);
    
    // 캐시 크기 제한 (100개)
    if (this.validationCache.size > 100) {
      const firstKey = this.validationCache.keys().next().value;
      if (firstKey !== undefined) {
        this.validationCache.delete(firstKey);
      }
    }
  }

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    this.validationCache.clear();
  }
}

// 편의를 위한 export
export const registrationEmailValidator = RegistrationEmailClientValidator.getInstance();