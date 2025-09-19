/**
 * 비밀번호 검증 동기화 테스트
 * 프론트엔드와 백엔드 검증 규칙이 일치하는지 확인
 */

import { securePasswordValidator } from '../utils/clientAuthValidation';

describe('Password Validation Sync Tests', () => {

  describe('프론트엔드-백엔드 동기화 검증', () => {

    // 백엔드에서 거부될 비밀번호들
    const backendRejectedPasswords = [
      {
        password: 'short',
        reason: '8자 미만',
        expectedError: '비밀번호는 8자 이상이어야 합니다'
      },
      {
        password: 'password',
        reason: '일반적인 비밀번호',
        expectedError: '너무 일반적이거나 예측 가능한 비밀번호입니다'
      },
      {
        password: 'password123',
        reason: '일반적인 비밀번호 변형',
        expectedError: '너무 일반적이거나 예측 가능한 비밀번호입니다'
      },
      {
        password: 'abcd1234',
        reason: '연속된 문자',
        expectedError: '연속된 문자나 숫자를 4개 이상 사용할 수 없습니다'
      },
      {
        password: 'Passss123',
        reason: '반복된 문자',
        expectedError: '같은 문자를 3번 이상 연속으로 사용할 수 없습니다'
      },
      {
        password: 'Pass word1!',
        reason: '공백 포함',
        expectedError: '비밀번호에 공백을 포함할 수 없습니다'
      },
      {
        password: 'password1',
        reason: '문자 종류 부족 (소문자+숫자만)',
        expectedError: '대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다'
      },
      {
        password: 'PASSWORD1',
        reason: '문자 종류 부족 (대문자+숫자만)',
        expectedError: '대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다'
      }
    ];

    // 백엔드에서 허용될 비밀번호들
    const backendAcceptedPasswords = [
      {
        password: 'Password123!',
        reason: '모든 요구사항 충족'
      },
      {
        password: 'MyP@ssw0rd',
        reason: '모든 요구사항 충족'
      },
      {
        password: 'Test#2024Pass',
        reason: '모든 요구사항 충족'
      },
      {
        password: 'Secure@789Key',
        reason: '모든 요구사항 충족'
      }
    ];

    describe('백엔드에서 거부될 비밀번호 검증', () => {
      backendRejectedPasswords.forEach(({ password, reason, expectedError }) => {
        it(`should reject "${password}" - ${reason}`, () => {
          const result = securePasswordValidator.validateSecurePassword(password);

          expect(result.isValid).toBe(false);
          expect(result.fieldErrors.length).toBeGreaterThan(0);

          // 에러 메시지가 백엔드와 유사한지 확인
          const errorMessages = result.fieldErrors.map(e => e.errorMessage);
          const hasExpectedError = errorMessages.some(msg =>
            msg.includes(expectedError) ||
            msg.toLowerCase().includes(reason.toLowerCase())
          );

          if (!hasExpectedError) {
            console.log(`Expected error containing: "${expectedError}"`);
            console.log(`Actual errors:`, errorMessages);
          }

          expect(hasExpectedError).toBe(true);
        });
      });
    });

    describe('백엔드에서 허용될 비밀번호 검증', () => {
      backendAcceptedPasswords.forEach(({ password, reason }) => {
        it(`should accept "${password}" - ${reason}`, () => {
          const result = securePasswordValidator.validateSecurePassword(password);

          if (!result.isValid) {
            console.log(`Password "${password}" failed with errors:`,
              result.fieldErrors.map(e => e.errorMessage));
          }

          expect(result.isValid).toBe(true);
          expect(result.fieldErrors.length).toBe(0);
        });
      });
    });
  });

  describe('특정 시나리오 테스트', () => {

    it('이메일이 비밀번호에 포함된 경우 거부', () => {
      const email = 'test@example.com';
      const password = 'test@example123!';

      const result = securePasswordValidator.validateSecurePassword(
        password,
        { registrationEmailValue: email }
      );

      expect(result.isValid).toBe(false);
      const hasPersonalInfoError = result.fieldErrors.some(e =>
        e.errorMessage.includes('개인정보') ||
        e.errorMessage.includes('이메일')
      );
      expect(hasPersonalInfoError).toBe(true);
    });

    it('이름이 비밀번호에 포함된 경우 거부', () => {
      const name = 'John Doe';
      const password = 'John123!@#';

      const result = securePasswordValidator.validateSecurePassword(
        password,
        { profileNameValue: name }
      );

      expect(result.isValid).toBe(false);
      const hasPersonalInfoError = result.fieldErrors.some(e =>
        e.errorMessage.includes('개인정보') ||
        e.errorMessage.includes('이름')
      );
      expect(hasPersonalInfoError).toBe(true);
    });

    it('엔트로피가 낮은 비밀번호 거부', () => {
      const password = 'Aa1!Aa1!'; // 반복 패턴

      const result = securePasswordValidator.validateSecurePassword(password);

      // 엔트로피가 낮거나 다른 문제가 있어야 함
      if (result.isValid) {
        console.log('Low entropy password was accepted:', password);
        console.log('Validation result:', result);
      }

      expect(result.isValid).toBe(false);
    });
  });

  describe('비밀번호 강도 평가', () => {

    const strengthTestCases = [
      {
        password: 'password',
        expectedStrength: 'VERY_WEAK'
      },
      {
        password: 'Password1',
        expectedStrength: 'WEAK'
      },
      {
        password: 'Password123!',
        expectedStrength: 'MODERATE'
      },
      {
        password: 'MySecure#Pass2024',
        expectedStrength: 'STRONG'
      },
      {
        password: 'V3ry$ecure&Complex!P@ssw0rd#2024',
        expectedStrength: 'VERY_STRONG'
      }
    ];

    strengthTestCases.forEach(({ password, expectedStrength }) => {
      it(`should evaluate "${password}" as ${expectedStrength}`, () => {
        const result = securePasswordValidator.validateSecurePassword(password);

        if (result.enhancedMetadata?.securePasswordMetrics?.strengthLevel) {
          const actualStrength = result.enhancedMetadata.securePasswordMetrics.strengthLevel;

          // 강도 평가가 예상 범위 내에 있는지 확인
          const strengthOrder = ['VERY_WEAK', 'WEAK', 'MODERATE', 'STRONG', 'VERY_STRONG'];
          const expectedIndex = strengthOrder.indexOf(expectedStrength);
          const actualIndex = strengthOrder.indexOf(actualStrength);

          // ±1 레벨 오차 허용
          expect(Math.abs(actualIndex - expectedIndex)).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('개선 제안 테스트', () => {

    it('약한 비밀번호에 대해 개선 제안을 제공해야 함', () => {
      const password = 'password1';

      const result = securePasswordValidator.validateSecurePassword(password);

      expect(result.isValid).toBe(false);

      if (result.enhancedMetadata?.securePasswordMetrics?.improvementTips) {
        const tips = result.enhancedMetadata.securePasswordMetrics.improvementTips;
        expect(tips.length).toBeGreaterThan(0);

        // 대문자나 특수문자 추가 제안이 있어야 함
        const hasUsefulTip = tips.some(tip =>
          tip.includes('대문자') ||
          tip.includes('특수문자') ||
          tip.includes('더 긴')
        );
        expect(hasUsefulTip).toBe(true);
      }
    });
  });
});

// 백엔드 규칙과의 정확한 매칭을 위한 상수
export const BACKEND_PASSWORD_RULES = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  MIN_ENTROPY: 35,
  MIN_CATEGORIES: 3,
  MAX_SEQUENTIAL: 3,  // 4자 이상 금지
  MAX_REPEATED: 2,    // 3자 이상 금지
  NO_SPACES: true,
  NO_COMMON_PASSWORDS: true,
  NO_PERSONAL_INFO: true
};

// 테스트 헬퍼 함수
export function validatePasswordSync(password: string, context?: any) {
  const frontendResult = securePasswordValidator.validateSecurePassword(password, context);

  // 백엔드 규칙 시뮬레이션
  const backendChecks = {
    length: password.length >= BACKEND_PASSWORD_RULES.MIN_LENGTH &&
            password.length <= BACKEND_PASSWORD_RULES.MAX_LENGTH,
    categories: countCategories(password) >= BACKEND_PASSWORD_RULES.MIN_CATEGORIES,
    noSequential: !hasSequential(password, 4),
    noRepeated: !hasRepeated(password, 3),
    noSpaces: !password.includes(' '),
    // 추가 체크는 실제 백엔드 로직 필요
  };

  const backendValid = Object.values(backendChecks).every(check => check === true);

  return {
    frontendValid: frontendResult.isValid,
    backendValid,
    inSync: frontendResult.isValid === backendValid,
    details: {
      frontend: frontendResult,
      backend: backendChecks
    }
  };
}

// 헬퍼 함수들
function countCategories(password: string): number {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/[0-9]/.test(password)) count++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) count++;
  return count;
}

function hasSequential(password: string, length: number): boolean {
  const lower = password.toLowerCase();
  for (let i = 0; i <= lower.length - length; i++) {
    const segment = lower.substring(i, i + length);
    let isSeq = true;
    for (let j = 0; j < length - 1; j++) {
      if (segment.charCodeAt(j + 1) !== segment.charCodeAt(j) + 1) {
        isSeq = false;
        break;
      }
    }
    if (isSeq) return true;
  }
  return false;
}

function hasRepeated(password: string, length: number): boolean {
  const regex = new RegExp(`(.)\\1{${length - 1},}`);
  return regex.test(password);
}