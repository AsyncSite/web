/**
 * Secure Password Input Validator
 * 
 * 보안 비밀번호 클라이언트 측 검증기
 * 백엔드 PasswordValidationService와 동기화된 검증 로직
 */

import {
  ClientAuthFormValidationResult,
  ClientAuthFieldError,
  ClientAuthFieldWarning,
  ClientAuthValidationErrorCodes,
  ClientAuthValidationErrorMessagesKO,
  ClientPasswordStrengthTier,
  RegistrationUserContext,
  RealtimeValidationOptions
} from '../types';

import {
  SECURE_PASSWORD_LENGTH_LIMITS,
  SECURE_PASSWORD_CHARACTER_PATTERNS,
  SECURE_PASSWORD_SPECIAL_CHARACTERS,
  SECURE_PASSWORD_CHARACTER_REQUIREMENTS,
  SECURE_PASSWORD_PATTERN_LIMITS,
  SECURE_PASSWORD_KEYBOARD_PATTERNS,
  SECURE_PASSWORD_COMMON_PASSWORDS,
  SECURE_PASSWORD_COMMON_BASE_WORDS,
  SECURE_PASSWORD_CHARSET_SIZES,
  SECURE_PASSWORD_ENTROPY_THRESHOLDS,
  SECURE_PASSWORD_CRACK_TIME_ESTIMATES,
  SECURE_PASSWORD_IMPROVEMENT_TIPS,
  BACKEND_SYNC_PASSWORD_RULES,
  BACKEND_SYNC_PASSWORD_STRENGTH
} from '../constants';

/**
 * 보안 비밀번호 검증 클래스
 */
export class SecurePasswordInputValidator {
  private static instance: SecurePasswordInputValidator;
  private entropyCache: Map<string, number>;

  private constructor() {
    this.entropyCache = new Map();
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): SecurePasswordInputValidator {
    if (!SecurePasswordInputValidator.instance) {
      SecurePasswordInputValidator.instance = new SecurePasswordInputValidator();
    }
    return SecurePasswordInputValidator.instance;
  }

  /**
   * 비밀번호 검증 메인 함수
   */
  public validateSecurePassword(
    password: string,
    context?: RegistrationUserContext,
    options?: RealtimeValidationOptions
  ): ClientAuthFormValidationResult {
    const startTime = performance.now();
    
    const errors: ClientAuthFieldError[] = [];
    const warnings: ClientAuthFieldWarning[] = [];
    const improvementTips: string[] = [];

    // 1. 필수 입력 검증
    if (!password) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_FIELD_EMPTY,
        'critical'
      ));
      return this.createResult(errors, warnings, startTime);
    }

    // 2. 길이 검증
    const lengthValidation = this.validatePasswordLength(password, options);
    if (lengthValidation.error) {
      errors.push(lengthValidation.error);
    }
    if (lengthValidation.warning) {
      warnings.push(lengthValidation.warning);
    }
    if (lengthValidation.tip) {
      improvementTips.push(lengthValidation.tip);
    }

    // 3. 공백 문자 검증 (백엔드와 동기화)
    if (password.includes(' ')) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_CONTAINS_SPACE,
        'major'
      ));
    }

    // 4. 문자 종류 검증
    const charTypeValidation = this.validateCharacterTypes(password, options);
    if (charTypeValidation.error) {
      errors.push(charTypeValidation.error);
    }
    // tips는 나중에 generateImprovementTips에서 한 번만 추가하도록 제거
    // improvementTips.push(...charTypeValidation.tips);

    // 5. 연속/반복 문자 검증
    const patternValidation = this.validatePatterns(password);
    if (patternValidation.sequentialError) {
      errors.push(patternValidation.sequentialError);
    }
    if (patternValidation.repeatedError) {
      errors.push(patternValidation.repeatedError);
    }
    if (patternValidation.keyboardError) {
      warnings.push({
        warningCode: 'KEYBOARD_PATTERN',
        warningMessage: '키보드 패턴이 감지되었습니다',
        improvementSuggestion: '예측하기 어려운 조합을 사용하세요',
        securityRiskLevel: 'medium'
      });
    }

    // 6. 개인정보 포함 검증
    if (context) {
      const personalInfoValidation = this.checkPersonalInfoInclusion(password, context);
      if (personalInfoValidation) {
        errors.push(personalInfoValidation);
      }
    }

    // 7. 공통 비밀번호 검증
    const commonPasswordCheck = this.checkCommonPassword(password);
    if (commonPasswordCheck.error) {
      errors.push(commonPasswordCheck.error);
    }
    if (commonPasswordCheck.warning) {
      warnings.push(commonPasswordCheck.warning);
    }

    // 8. 엔트로피 계산 및 강도 평가
    const entropy = this.calculateEntropy(password);
    const strength = this.getPasswordStrength(entropy);
    const crackTime = this.estimateCrackTime(entropy);

    // 9. 엔트로피 기반 검증 - 백엔드와 동기화
    const backendSync_minEntropy = BACKEND_SYNC_PASSWORD_RULES.MIN_ENTROPY_REQUIRED;

    if (entropy < backendSync_minEntropy) {
      errors.push(this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_ENTROPY_TOO_LOW,
        'critical',
        { violatedRule: `보안 수준이 너무 낮습니다 (현재: ${Math.round((entropy / backendSync_minEntropy) * 100)}%)` }
      ));
    } else if (entropy < SECURE_PASSWORD_ENTROPY_THRESHOLDS.WEAK) {
      warnings.push({
        warningCode: 'LOW_ENTROPY',
        warningMessage: '비밀번호 강도가 약합니다',
        improvementSuggestion: '더 복잡한 조합을 사용하세요',
        securityRiskLevel: 'medium'
      });
    }

    // 10. 개선 제안 생성
    if (entropy < SECURE_PASSWORD_ENTROPY_THRESHOLDS.STRONG) {
      improvementTips.push(...this.generateImprovementTips(password, charTypeValidation.types));
    }

    // 결과 생성
    return this.createResult(errors, warnings, startTime, {
      strengthLevel: strength,
      entropyScore: entropy,
      estimatedCrackTime: crackTime,
      improvementTips: improvementTips.length > 0 ? improvementTips : undefined,
      characterSetDiversity: charTypeValidation.types.length
    });
  }

  /**
   * 길이 검증
   */
  private validatePasswordLength(
    password: string,
    options?: RealtimeValidationOptions
  ): { error?: ClientAuthFieldError; warning?: ClientAuthFieldWarning; tip?: string } {
    const minLength = options?.securePasswordOptions?.minimumLength || 
                     SECURE_PASSWORD_LENGTH_LIMITS.ABSOLUTE_MIN;
    const maxLength = options?.securePasswordOptions?.maximumLength || 
                     SECURE_PASSWORD_LENGTH_LIMITS.ABSOLUTE_MAX;

    if (password.length < minLength) {
      return {
        error: this.createError(
          ClientAuthValidationErrorCodes.SECURE_PASSWORD_LENGTH_TOO_SHORT,
          'major'
        )
      };
    }

    if (password.length > maxLength) {
      return {
        error: this.createError(
          ClientAuthValidationErrorCodes.SECURE_PASSWORD_LENGTH_TOO_LONG,
          'major'
        )
      };
    }

    // 권장 길이 체크
    if (password.length < SECURE_PASSWORD_LENGTH_LIMITS.RECOMMENDED_MIN) {
      return {
        warning: {
          warningCode: 'SHORT_PASSWORD',
          warningMessage: `${SECURE_PASSWORD_LENGTH_LIMITS.RECOMMENDED_MIN}자 이상을 권장합니다`,
          improvementSuggestion: SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_LENGTH,
          securityRiskLevel: 'medium'
        },
        tip: SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_LENGTH
      };
    }

    return {};
  }

  /**
   * 문자 종류 검증
   */
  private validateCharacterTypes(
    password: string,
    options?: RealtimeValidationOptions
  ): { error?: ClientAuthFieldError; tips: string[]; types: string[] } {
    const types: string[] = [];
    const tips: string[] = [];

    if (SECURE_PASSWORD_CHARACTER_PATTERNS.UPPERCASE.test(password)) {
      types.push('uppercase');
    } else {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_UPPERCASE);
    }

    if (SECURE_PASSWORD_CHARACTER_PATTERNS.LOWERCASE.test(password)) {
      types.push('lowercase');
    } else {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_LOWERCASE);
    }

    if (SECURE_PASSWORD_CHARACTER_PATTERNS.NUMBERS.test(password)) {
      types.push('numbers');
    } else {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_NUMBERS);
    }

    if (SECURE_PASSWORD_CHARACTER_PATTERNS.SPECIAL_CHARS.test(password)) {
      types.push('special');
    } else {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_SPECIAL);
    }

    const requiredTypes = options?.securePasswordOptions?.minimumCharacterTypes || 
                         SECURE_PASSWORD_CHARACTER_REQUIREMENTS.MINIMUM_CHARACTER_TYPES;

    if (types.length < requiredTypes) {
      return {
        error: this.createError(
          ClientAuthValidationErrorCodes.SECURE_PASSWORD_CHAR_TYPES_INSUFFICIENT,
          'major',
          { violatedRule: `${types.length}/${requiredTypes} types` }
        ),
        tips,
        types
      };
    }

    return { tips, types };
  }

  /**
   * 패턴 검증 (연속, 반복, 키보드)
   */
  private validatePatterns(password: string): {
    sequentialError?: ClientAuthFieldError;
    repeatedError?: ClientAuthFieldError;
    keyboardError?: boolean;
  } {
    const result: any = {};

    // 연속 문자 검증
    if (this.hasSequentialCharacters(password)) {
      result.sequentialError = this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_SEQUENTIAL_PATTERN,
        'major'
      );
    }

    // 반복 문자 검증
    if (this.hasRepeatedCharacters(password)) {
      result.repeatedError = this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_REPEATED_PATTERN,
        'major'
      );
    }

    // 반복 시퀀스 검증 (예: Aa1!Aa1!)
    if (this.hasRepeatedSequence(password)) {
      result.repeatedError = this.createError(
        ClientAuthValidationErrorCodes.SECURE_PASSWORD_ENTROPY_TOO_LOW,
        'major'
      );
    }

    // 키보드 패턴 검증
    if (this.hasKeyboardPattern(password)) {
      result.keyboardError = true;
    }

    return result;
  }

  /**
   * 연속 문자 검사 - 백엔드와 동기화 (4자 이상 금지)
   */
  private hasSequentialCharacters(password: string): boolean {
    // 백엔드와 동일하게 4자 이상 연속 문자 검사
    const backendSync_minSeqLength = BACKEND_SYNC_PASSWORD_RULES.MIN_SEQUENTIAL_LENGTH_TO_CHECK;
    const lowerPassword = password.toLowerCase();
    
    // 4자 이상 연속된 패턴만 체크
    if (lowerPassword.length < backendSync_minSeqLength) return false;
    
    for (let i = 0; i <= lowerPassword.length - backendSync_minSeqLength; i++) {
      const chars = lowerPassword.substring(i, i + backendSync_minSeqLength);
      
      // 알파벳 연속 체크 (abcd, dcba 등)
      if (chars.match(/^[a-z]+$/)) {
        let backendSync_isSequential = true;
        let backendSync_isReverseSequential = true;
        
        for (let j = 0; j < backendSync_minSeqLength - 1; j++) {
          if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
            backendSync_isSequential = false;
          }
          if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) - 1) {
            backendSync_isReverseSequential = false;
          }
        }
        
        if (backendSync_isSequential || backendSync_isReverseSequential) return true;
      }
      
      // 숫자 연속 체크 (1234, 4321 등)
      if (chars.match(/^[0-9]+$/)) {
        let backendSync_isNumSequential = true;
        let backendSync_isNumReverseSequential = true;
        
        for (let j = 0; j < backendSync_minSeqLength - 1; j++) {
          if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
            backendSync_isNumSequential = false;
          }
          if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) - 1) {
            backendSync_isNumReverseSequential = false;
          }
        }
        
        if (backendSync_isNumSequential || backendSync_isNumReverseSequential) return true;
      }
    }

    return false;
  }

  /**
   * 반복 문자 검사 - 백엔드와 동기화 (3자 이상 금지)
   */
  private hasRepeatedCharacters(password: string): boolean {
    // 백엔드와 동일하게 3자 이상 반복 문자 검사
    const backendSync_minRepLength = BACKEND_SYNC_PASSWORD_RULES.MIN_REPEATED_LENGTH_TO_CHECK;
    const backendSync_repeatRegex = new RegExp(`(.)\\1{${backendSync_minRepLength - 1},}`);
    return backendSync_repeatRegex.test(password);
  }

  /**
   * 반복 시퀀스 검사 (예: Aa1!Aa1! 같은 패턴)
   */
  private hasRepeatedSequence(password: string): boolean {
    // 비밀번호가 너무 짧으면 검사 생략
    if (password.length < 4) return false;

    // 반으로 나누어 같은지 확인 (정확히 반복되는 경우)
    const halfLength = Math.floor(password.length / 2);
    if (password.length % 2 === 0) {
      const firstHalf = password.substring(0, halfLength);
      const secondHalf = password.substring(halfLength);
      if (firstHalf === secondHalf) return true;
    }

    // 3-4자 패턴이 반복되는지 확인
    for (let patternLength = 3; patternLength <= 4; patternLength++) {
      for (let i = 0; i <= password.length - patternLength * 2; i++) {
        const pattern = password.substring(i, i + patternLength);
        const nextPattern = password.substring(i + patternLength, i + patternLength * 2);
        if (pattern === nextPattern) return true;
      }
    }

    return false;
  }

  /**
   * 키보드 패턴 검사
   */
  private hasKeyboardPattern(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    const maxLen = SECURE_PASSWORD_PATTERN_LIMITS.MAX_KEYBOARD_PATTERN;

    for (const pattern of SECURE_PASSWORD_KEYBOARD_PATTERNS) {
      for (let i = 0; i <= pattern.length - maxLen; i++) {
        const segment = pattern.substring(i, i + maxLen);
        if (lowerPassword.includes(segment)) {
          return true;
        }
        // 역순도 검사
        if (lowerPassword.includes(segment.split('').reverse().join(''))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 개인정보 포함 검사
   */
  private checkPersonalInfoInclusion(
    password: string,
    context: RegistrationUserContext
  ): ClientAuthFieldError | null {
    const lowerPassword = password.toLowerCase();

    // 이메일 포함 검사
    if (context.registrationEmailValue) {
      const emailLocalPart = context.registrationEmailValue.split('@')[0].toLowerCase();
      if (emailLocalPart.length >= 3 && lowerPassword.includes(emailLocalPart)) {
        return this.createError(
          ClientAuthValidationErrorCodes.SECURE_PASSWORD_PERSONAL_INFO_INCLUDED,
          'major',
          { violatedRule: 'Contains email' }
        );
      }
    }

    // 이름 포함 검사
    if (context.profileNameValue) {
      const nameParts = context.profileNameValue.toLowerCase().split(/\s+/);
      for (const part of nameParts) {
        if (part.length >= 3 && lowerPassword.includes(part)) {
          return this.createError(
            ClientAuthValidationErrorCodes.SECURE_PASSWORD_PERSONAL_INFO_INCLUDED,
            'major',
            { violatedRule: 'Contains name' }
          );
        }
      }
    }

    return null;
  }

  /**
   * 공통 비밀번호 검사
   */
  private checkCommonPassword(password: string): {
    error?: ClientAuthFieldError;
    warning?: ClientAuthFieldWarning;
  } {
    const lowerPassword = password.toLowerCase();

    // 정확한 매칭
    if ((SECURE_PASSWORD_COMMON_PASSWORDS as readonly string[]).includes(password) ||
        (SECURE_PASSWORD_COMMON_PASSWORDS as readonly string[]).includes(lowerPassword)) {
      return {
        error: this.createError(
          ClientAuthValidationErrorCodes.SECURE_PASSWORD_COMMON_PASSWORD,
          'critical'
        )
      };
    }

    // 베이스 단어 검사 (대소문자+특수문자 변형 허용)
    for (const baseWord of SECURE_PASSWORD_COMMON_BASE_WORDS) {
      if (lowerPassword === baseWord) {
        return {
          error: this.createError(
            ClientAuthValidationErrorCodes.SECURE_PASSWORD_COMMON_PASSWORD,
            'major'
          )
        };
      }

      // 복잡한 변형인 경우 경고만
      if (lowerPassword.includes(baseWord) && 
          password !== lowerPassword && 
          /[!@#$%^&*]/.test(password)) {
        return {
          warning: {
            warningCode: 'COMMON_BASE_WORD',
            warningMessage: '일반적인 단어가 포함되어 있습니다',
            improvementSuggestion: '더 독특한 조합을 사용하세요',
            securityRiskLevel: 'medium'
          }
        };
      }
    }

    return {};
  }

  /**
   * 엔트로피 계산
   */
  private calculateEntropy(password: string): number {
    // 캐시 확인
    const cached = this.entropyCache.get(password);
    if (cached !== undefined) {
      return cached;
    }

    let charsetSize = 0;

    // 사용된 문자셋 크기 계산 (백엔드와 맞추기 위해 보수적으로 계산)
    if (SECURE_PASSWORD_CHARACTER_PATTERNS.LOWERCASE.test(password)) {
      charsetSize += SECURE_PASSWORD_CHARSET_SIZES.LOWERCASE;
    }
    if (SECURE_PASSWORD_CHARACTER_PATTERNS.UPPERCASE.test(password)) {
      charsetSize += SECURE_PASSWORD_CHARSET_SIZES.UPPERCASE;
    }
    if (SECURE_PASSWORD_CHARACTER_PATTERNS.NUMBERS.test(password)) {
      charsetSize += SECURE_PASSWORD_CHARSET_SIZES.DIGITS;
    }
    if (SECURE_PASSWORD_CHARACTER_PATTERNS.SPECIAL_CHARS.test(password)) {
      // 특수문자는 보수적으로 계산 (백엔드 동기화)
      charsetSize += 10; // 일반적으로 사용되는 특수문자 수만 고려
    }
    if (SECURE_PASSWORD_CHARACTER_PATTERNS.SPACE.test(password)) {
      charsetSize += SECURE_PASSWORD_CHARSET_SIZES.SPACE;
    }

    // 엔트로피 = log2(charsetSize^length) = length * log2(charsetSize)
    let baseEntropy = password.length * Math.log2(charsetSize);

    // 백엔드와 동기화를 위한 스케일링 팩터 적용 (0.75)
    // 백엔드는 더 보수적인 엔트로피 계산을 사용하는 것으로 보임
    baseEntropy = baseEntropy * 0.75;

    // 패턴 페널티 적용
    let penalty = 0;
    if (this.hasSequentialCharacters(password)) penalty += 5;
    if (this.hasRepeatedCharacters(password)) penalty += 5;
    if (this.hasRepeatedSequence(password)) penalty += 15; // 반복 시퀀스는 큰 페널티
    if (this.hasKeyboardPattern(password)) penalty += 3;

    const finalEntropy = Math.max(0, baseEntropy - penalty);

    // 캐시 저장
    this.entropyCache.set(password, finalEntropy);
    if (this.entropyCache.size > 100) {
      const firstKey = this.entropyCache.keys().next().value;
      if (firstKey !== undefined) {
        this.entropyCache.delete(firstKey);
      }
    }

    return finalEntropy;
  }

  /**
   * 비밀번호 강도 평가 - 백엔드 PasswordStrength와 동기화
   */
  private getPasswordStrength(entropy: number): ClientPasswordStrengthTier {
    // 백엔드와 동일한 강도 분류 사용
    const backendSync_strengthRanges = BACKEND_SYNC_PASSWORD_STRENGTH;
    
    if (entropy >= backendSync_strengthRanges.VERY_STRONG.min) {
      return ClientPasswordStrengthTier.VERY_STRONG;
    }
    if (entropy >= backendSync_strengthRanges.STRONG.min) {
      return ClientPasswordStrengthTier.STRONG;
    }
    if (entropy >= backendSync_strengthRanges.MEDIUM.min) {
      return ClientPasswordStrengthTier.MODERATE;
    }
    if (entropy >= backendSync_strengthRanges.WEAK.min) {
      return ClientPasswordStrengthTier.WEAK;
    }
    return ClientPasswordStrengthTier.VERY_WEAK;
  }

  /**
   * 크랙 시간 추정
   */
  private estimateCrackTime(entropy: number): string {
    const thresholds = Object.keys(SECURE_PASSWORD_CRACK_TIME_ESTIMATES)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of thresholds) {
      if (entropy >= threshold) {
        return (SECURE_PASSWORD_CRACK_TIME_ESTIMATES as any)[threshold];
      }
    }

    return '즉시';
  }

  /**
   * 개선 제안 생성 - 중복 제거하고 최대 2개만 반환
   */
  private generateImprovementTips(password: string, currentTypes: string[]): string[] {
    const tips: string[] = [];

    // 가장 중요한 개선사항만 추가 (우선순위 순)
    if (!currentTypes.includes('uppercase')) {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_UPPERCASE);
    }
    
    if (!currentTypes.includes('special')) {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_SPECIAL);
    }
    
    if (tips.length < 2 && !currentTypes.includes('numbers')) {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_NUMBERS);
    }
    
    if (tips.length < 2 && password.length < SECURE_PASSWORD_LENGTH_LIMITS.OPTIMAL_MIN) {
      tips.push(SECURE_PASSWORD_IMPROVEMENT_TIPS.ADD_LENGTH);
    }

    // 최대 2개만 반환
    return tips.slice(0, 2);
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
      fieldName: 'signupPassword',
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
    passwordMetrics?: any
  ): ClientAuthFormValidationResult {
    const endTime = performance.now();
    
    return {
      isValid: errors.length === 0,
      fieldErrors: errors,
      fieldWarnings: warnings,
      enhancedMetadata: passwordMetrics ? {
        securePasswordMetrics: passwordMetrics
      } : undefined,
      performanceMetrics: {
        validationTimeMs: endTime - startTime,
        asyncChecksCompleted: false
      }
    };
  }

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    this.entropyCache.clear();
  }
}

// 편의를 위한 export
export const securePasswordValidator = SecurePasswordInputValidator.getInstance();