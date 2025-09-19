import React, { useMemo } from 'react';
import { securePasswordValidator } from '../../utils/clientAuthValidation';
import './PasswordStrengthIndicator.css';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  email?: string;
  name?: string;
  showRequirements?: boolean;
  showStrengthBar?: boolean;
  className?: string;
}

/**
 * 비밀번호 강도 표시 및 요구사항 체크리스트 컴포넌트
 * 백엔드 검증 규칙과 동기화되어 실시간 피드백 제공
 */
function PasswordStrengthIndicator({
  password,
  email,
  name,
  showRequirements = true,
  showStrengthBar = true,
  className = ''
}: PasswordStrengthIndicatorProps): React.ReactNode {

  // 실시간 검증 결과
  const validationResult = useMemo(() => {
    if (!password) return null;

    return securePasswordValidator.validateSecurePassword(
      password,
      {
        registrationEmailValue: email,
        profileNameValue: name
      }
    );
  }, [password, email, name]);

  // 요구사항 체크리스트
  const requirements = useMemo<PasswordRequirement[]>(() => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const charTypes = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

    return [
      {
        id: 'length',
        label: '8자 이상',
        validator: (p) => p.length >= 8,
        met: password.length >= 8
      },
      {
        id: 'charTypes',
        label: '영문 대/소문자, 숫자, 특수문자 중 3가지 조합',
        validator: (p) => {
          const upper = /[A-Z]/.test(p);
          const lower = /[a-z]/.test(p);
          const num = /[0-9]/.test(p);
          const special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
          return [upper, lower, num, special].filter(Boolean).length >= 3;
        },
        met: charTypes >= 3
      },
      {
        id: 'noSequential',
        label: '연속된 문자/숫자 4개 미만 (abcd, 1234 불가)',
        validator: (p) => {
          const lower = p.toLowerCase();
          for (let i = 0; i <= lower.length - 4; i++) {
            const chars = lower.substring(i, i + 4);
            if (/^[a-z]{4}$/.test(chars)) {
              let isSeq = true;
              for (let j = 0; j < 3; j++) {
                if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
                  isSeq = false;
                  break;
                }
              }
              if (isSeq) return false;
            }
            if (/^[0-9]{4}$/.test(chars)) {
              let isSeq = true;
              for (let j = 0; j < 3; j++) {
                if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
                  isSeq = false;
                  break;
                }
              }
              if (isSeq) return false;
            }
          }
          return true;
        },
        met: !hasSequentialPattern(password)
      },
      {
        id: 'noRepeated',
        label: '같은 문자 3번 미만 반복 (aaa, 111 불가)',
        validator: (p) => !/(.)\1{2,}/.test(p),
        met: !/(.)\1{2,}/.test(password)
      },
      {
        id: 'noSpace',
        label: '공백 미포함',
        validator: (p) => !/\s/.test(p),
        met: !/\s/.test(password)
      }
    ];
  }, [password]);

  // 강도 계산
  const strength = useMemo(() => {
    if (!validationResult) return 0;

    const strengthLevel = validationResult.enhancedMetadata?.securePasswordMetrics?.strengthLevel;
    switch (strengthLevel) {
      case 'VERY_WEAK': return 1;
      case 'WEAK': return 2;
      case 'MODERATE': return 3;
      case 'STRONG': return 4;
      case 'VERY_STRONG': return 5;
      default: return 0;
    }
  }, [validationResult]);

  const strengthLabels = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];
  const strengthColors = ['', '#ff4458', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];

  if (!password) {
    return null;
  }

  return (
    <div className={`password-strength-indicator ${className}`}>
      {showStrengthBar && (
        <div className="password-strength-bar">
          <div className="strength-bar-container">
            <div
              className="strength-bar-fill"
              style={{
                width: `${(strength / 5) * 100}%`,
                backgroundColor: strengthColors[strength]
              }}
            />
          </div>
          <div
            className="strength-label"
            style={{ color: strengthColors[strength] }}
          >
            {strengthLabels[strength]}
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="password-requirements">
          <div className="requirements-title">비밀번호 요구사항:</div>
          {requirements.map(req => (
            <div
              key={req.id}
              className={`requirement-item ${req.met ? 'met' : 'unmet'}`}
            >
              <span className="requirement-icon">
                {req.met ? '✅' : '⭕'}
              </span>
              <span className="requirement-label">
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {validationResult && !validationResult.isValid && (
        <div className="password-warnings">
          {validationResult.fieldErrors.slice(0, 2).map((error, index) => (
            <div key={index} className="warning-item">
              ⚠️ {error.errorMessage}
            </div>
          ))}
        </div>
      )}

      {validationResult?.enhancedMetadata?.securePasswordMetrics?.improvementTips && (
        <div className="password-tips">
          {validationResult.enhancedMetadata.securePasswordMetrics.improvementTips
            .slice(0, 2)
            .map((tip, index) => (
              <div key={index} className="tip-item">
                💡 {tip}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Helper function to check sequential patterns
function hasSequentialPattern(password: string): boolean {
  const lower = password.toLowerCase();

  if (lower.length < 4) return false;

  for (let i = 0; i <= lower.length - 4; i++) {
    const chars = lower.substring(i, i + 4);

    // Check alphabetic sequences
    if (/^[a-z]{4}$/.test(chars)) {
      let isSequential = true;
      let isReverseSequential = true;

      for (let j = 0; j < 3; j++) {
        if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
          isSequential = false;
        }
        if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) - 1) {
          isReverseSequential = false;
        }
      }

      if (isSequential || isReverseSequential) return true;
    }

    // Check numeric sequences
    if (/^[0-9]{4}$/.test(chars)) {
      let isSequential = true;
      let isReverseSequential = true;

      for (let j = 0; j < 3; j++) {
        if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) + 1) {
          isSequential = false;
        }
        if (chars.charCodeAt(j + 1) !== chars.charCodeAt(j) - 1) {
          isReverseSequential = false;
        }
      }

      if (isSequential || isReverseSequential) return true;
    }
  }

  return false;
}

export default PasswordStrengthIndicator;