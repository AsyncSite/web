/**
 * Enhanced PasswordChangeModal with Client-side Validation
 * 
 * 백엔드와 동기화된 검증 시스템을 적용한 비밀번호 변경 모달
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PasswordChangeModal.css';

// 새로운 검증 시스템 import
import {
  validatePasswordChangeForm,
  securePasswordValidator,
  ClientPasswordStrengthTier,
  RegistrationUserContext,
  RealtimeValidationOptions,
  ClientAuthFormValidationResult
} from '../../utils/clientAuthValidation';

interface PasswordChangeModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordFormWarnings {
  newPassword?: string[];
}

interface PasswordFormMetadata {
  newPasswordStrength?: ClientPasswordStrengthTier;
  newPasswordEntropy?: number;
  newPasswordCrackTime?: string;
  improvementTips?: string[];
}

function PasswordChangeModalEnhanced({ isOpen, onClose }: PasswordChangeModalEnhancedProps): React.ReactNode {
  const { changePassword, user } = useAuth();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [warnings, setWarnings] = useState<PasswordFormWarnings>({});
  const [metadata, setMetadata] = useState<PasswordFormMetadata>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 실시간 검증 상태
  const [realtimeValidation, setRealtimeValidation] = useState<{
    currentPassword?: ClientAuthFormValidationResult;
    newPassword?: ClientAuthFormValidationResult;
    confirmPassword?: ClientAuthFormValidationResult;
  }>({});

  // 검증 옵션
  const validationOptions: RealtimeValidationOptions = {
    enableRealtimeFeedback: true,
    debounceDelayMs: 300,
    validationLocale: 'ko',
    securePasswordOptions: {
      minimumLength: 8,
      maximumLength: 128,
      minimumCharacterTypes: 3,
      checkPersonalInfoInclusion: true,
      checkAgainstCommonPasswords: true
    }
  };

  // Enhanced new password validation
  useEffect(() => {
    if (!formData.newPassword) {
      setMetadata({});
      setWarnings({});
      return;
    }

    // Validate with user context
    const context: RegistrationUserContext = {
      registrationEmailValue: user?.email,
      profileNameValue: user?.name,
      existingPasswordHash: formData.currentPassword
    };
    
    const validation = securePasswordValidator.validateSecurePassword(
      formData.newPassword,
      context,
      validationOptions
    );
    
    setRealtimeValidation(prev => ({ ...prev, newPassword: validation }));
    
    // Update errors
    if (validation.fieldErrors.length > 0) {
      const criticalError = validation.fieldErrors.find(e => e.errorSeverity === 'critical');
      const majorError = validation.fieldErrors.find(e => e.errorSeverity === 'major');
      setErrors(prev => ({ 
        ...prev, 
        newPassword: criticalError?.errorMessage || majorError?.errorMessage || validation.fieldErrors[0].errorMessage 
      }));
    } else {
      setErrors(prev => ({ ...prev, newPassword: undefined }));
    }
    
    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      setErrors(prev => ({ 
        ...prev, 
        newPassword: '새 비밀번호는 현재 비밀번호와 달라야 합니다' 
      }));
    }
    
    // Update warnings
    if (validation.fieldWarnings && validation.fieldWarnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        newPassword: validation.fieldWarnings!.map(w => w.warningMessage)
      }));
    } else {
      setWarnings(prev => ({ ...prev, newPassword: undefined }));
    }
    
    // Update metadata
    if (validation.enhancedMetadata?.securePasswordMetrics) {
      const metrics = validation.enhancedMetadata.securePasswordMetrics;
      setMetadata(prev => ({
        ...prev,
        newPasswordStrength: metrics.strengthLevel,
        newPasswordEntropy: metrics.entropyScore,
        newPasswordCrackTime: metrics.estimatedCrackTime,
        improvementTips: metrics.improvementTips
      }));
    }
  }, [formData.newPassword, formData.currentPassword, user]);

  // Confirm password validation
  useEffect(() => {
    if (!formData.confirmPassword || !formData.newPassword) {
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: '비밀번호가 일치하지 않습니다' 
      }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [formData.confirmPassword, formData.newPassword]);

  if (!isOpen) return null;

  const validateFormEnhanced = (): boolean => {
    const validation = validatePasswordChangeForm(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword,
      user?.email,
      user?.name
    );
    
    const newErrors: PasswordFormErrors = {};
    
    if (!validation.currentPassword.isValid) {
      newErrors.currentPassword = validation.currentPassword.fieldErrors[0]?.errorMessage;
    }
    
    if (!validation.newPassword.isValid) {
      newErrors.newPassword = validation.newPassword.fieldErrors[0]?.errorMessage;
    }
    
    if (!validation.confirmPassword.isValid) {
      newErrors.confirmPassword = validation.confirmPassword.fieldErrors[0]?.errorMessage;
    }
    
    setErrors(newErrors);
    return validation.isFormValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof PasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormEnhanced()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      let errorMessage = '비밀번호 변경에 실패했습니다';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 에러 타입에 따른 구체적인 메시지
        if (errorMessage.includes('현재 비밀번호')) {
          setErrors({ 
            currentPassword: '현재 비밀번호가 올바르지 않습니다',
            general: errorMessage 
          });
        } else if (errorMessage.includes('약')) {
          setErrors({ 
            newPassword: errorMessage,
            general: '더 강력한 비밀번호를 선택해주세요' 
          });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setWarnings({});
    setMetadata({});
    setIsSuccess(false);
    onClose();
  };

  // Password strength visualization component
  const PasswordStrengthVisualization = () => {
    if (!metadata.newPasswordStrength) return null;
    
    const strengthData = {
      [ClientPasswordStrengthTier.CRITICALLY_WEAK]: { 
        width: 14, color: '#d32f2f', label: '매우 약함', emoji: '😰' 
      },
      [ClientPasswordStrengthTier.VERY_WEAK]: { 
        width: 28, color: '#f44336', label: '약함', emoji: '😟' 
      },
      [ClientPasswordStrengthTier.WEAK]: { 
        width: 42, color: '#ff9800', label: '보통', emoji: '😐' 
      },
      [ClientPasswordStrengthTier.MODERATE]: { 
        width: 56, color: '#ffc107', label: '적절함', emoji: '🙂' 
      },
      [ClientPasswordStrengthTier.STRONG]: { 
        width: 70, color: '#8bc34a', label: '강함', emoji: '😊' 
      },
      [ClientPasswordStrengthTier.VERY_STRONG]: { 
        width: 85, color: '#4caf50', label: '매우 강함', emoji: '😄' 
      },
      [ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG]: { 
        width: 100, color: '#2e7d32', label: '탁월함', emoji: '🔒' 
      }
    };
    
    const current = strengthData[metadata.newPasswordStrength];
    
    return (
      <div className="password-strength-visualization" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: current.color, fontWeight: 500 }}>
            {current.emoji} {current.label}
          </span>
          {metadata.newPasswordCrackTime && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              해독 시간: {metadata.newPasswordCrackTime}
            </span>
          )}
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div 
            style={{ 
              width: `${current.width}%`,
              height: '100%',
              backgroundColor: current.color,
              transition: 'all 0.3s ease',
              borderRadius: '4px',
              boxShadow: `0 0 10px ${current.color}40`
            }}
          />
        </div>
        
        {metadata.newPasswordEntropy && (
          <div style={{ 
            fontSize: '11px', 
            color: '#999', 
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>엔트로피: {metadata.newPasswordEntropy.toFixed(1)} bits</span>
            <span>
              {metadata.newPasswordStrength === ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG 
                ? '완벽합니다!' 
                : '더 강하게 만들 수 있어요'}
            </span>
          </div>
        )}
        
        {/* Improvement tips */}
        {metadata.improvementTips && metadata.improvementTips.length > 0 && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '4px', color: '#f57c00' }}>
              💡 개선 제안:
            </div>
            {metadata.improvementTips.map((tip, index) => (
              <div key={index} style={{ color: '#666', marginTop: '2px' }}>
                • {tip}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Warning display component
  const WarningDisplay = () => {
    if (!warnings.newPassword || warnings.newPassword.length === 0) return null;
    
    return (
      <div style={{ 
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#fff8e1',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {warnings.newPassword.map((warning, index) => (
          <div key={index} style={{ color: '#f57f17', marginTop: index > 0 ? '4px' : 0 }}>
            ⚠️ {warning}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose} />
      <div className="password-modal">
        <div className="modal-header">
          <h2>비밀번호 변경</h2>
          <button 
            className="modal-close" 
            onClick={handleClose} 
            aria-label="닫기"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">
            {errors.general}
          </div>
        )}

        {isSuccess && (
          <div className="success-message general-success" style={{
            padding: '12px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            ✅ 비밀번호가 성공적으로 변경되었습니다!
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password */}
          <div className="form-group auth-form-group">
            <label htmlFor="currentPassword" className="auth-label">
              현재 비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`auth-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="현재 비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
              >
                {showCurrentPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message auth-error-message">
                {errors.currentPassword}
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group auth-form-group">
            <label htmlFor="newPassword" className="auth-label">
              새 비밀번호
              {metadata.newPasswordStrength && (
                <span style={{ 
                  fontSize: '11px',
                  marginLeft: '8px',
                  color: metadata.newPasswordStrength === ClientPasswordStrengthTier.STRONG ||
                         metadata.newPasswordStrength === ClientPasswordStrengthTier.VERY_STRONG ||
                         metadata.newPasswordStrength === ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG
                    ? '#4caf50' : '#ff9800'
                }}>
                  (보안 수준 확인 중)
                </span>
              )}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`auth-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-message auth-error-message">
                {errors.newPassword}
              </span>
            )}
            <WarningDisplay />
            <PasswordStrengthVisualization />
          </div>

          {/* Confirm Password */}
          <div className="form-group auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">
              새 비밀번호 확인
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <span style={{ 
                  fontSize: '11px',
                  marginLeft: '8px',
                  color: '#4caf50'
                }}>
                  ✓ 일치
                </span>
              )}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="새 비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message auth-error-message">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="auth-button secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="auth-button primary"
              disabled={
                isSubmitting || 
                !formData.currentPassword || 
                !formData.newPassword || 
                !formData.confirmPassword ||
                !!errors.newPassword ||
                !!errors.confirmPassword ||
                (metadata.newPasswordStrength === ClientPasswordStrengthTier.CRITICALLY_WEAK) ||
                (metadata.newPasswordStrength === ClientPasswordStrengthTier.VERY_WEAK)
              }
            >
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>

          {/* Security tips */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>
              🔒 보안 팁
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>다른 사이트와 다른 고유한 비밀번호를 사용하세요</li>
              <li>개인정보(이름, 생일 등)를 포함하지 마세요</li>
              <li>주기적으로 비밀번호를 변경하세요</li>
              <li>비밀번호 관리자 사용을 고려해보세요</li>
            </ul>
          </div>
        </form>
      </div>
    </>
  );
}

export default PasswordChangeModalEnhanced;