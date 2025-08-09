import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordStrengthMeter, ValidationFeedback } from '../common/validation';
import { securePasswordValidator } from '../../utils/clientAuthValidation';
import { RegistrationUserContext } from '../../utils/clientAuthValidation/types';
import './PasswordChangeModal.css';

interface PasswordChangeModalProps {
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

function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps): React.ReactNode {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Backend sync validation states
  const [backendSync_passwordValidationResult, setBackendSync_passwordValidationResult] = useState<any>(null);
  const [backendSync_showEntropyValidation, setBackendSync_showEntropyValidation] = useState(true);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else {
      // Backend-synced password validation
      const backendSync_userContext: RegistrationUserContext = {
        // Use user's email/name if available from auth context
        registrationEmailValue: '',  // Would get from auth context
        profileNameValue: ''
      };
      
      const backendSync_validationResult = securePasswordValidator.validateSecurePassword(
        formData.newPassword,
        backendSync_userContext
      );
      
      setBackendSync_passwordValidationResult(backendSync_validationResult);
      
      if (!backendSync_validationResult.isValid && backendSync_validationResult.fieldErrors.length > 0) {
        // Use the most critical error
        const criticalError = backendSync_validationResult.fieldErrors.find(
          e => e.errorSeverity === 'critical'
        ) || backendSync_validationResult.fieldErrors[0];
        newErrors.newPassword = criticalError.errorMessage;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof PasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
      setErrors({
        general: error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다'
      });
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
    setIsSuccess(false);
    onClose();
  };

  // This function is replaced by backend-synced PasswordStrengthMeter component

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose} />
      <div className="password-modal">
        <div className="modal-header">
          <h2>비밀번호 변경</h2>
          <button className="modal-close" onClick={handleClose} aria-label="닫기">
            ×
          </button>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">
            {errors.general}
          </div>
        )}

        {isSuccess && (
          <div className="success-message general-success">
            비밀번호가 성공적으로 변경되었습니다!
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group auth-form-group">
            <label htmlFor="currentPassword" className="auth-label">
              현재 비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`auth-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="현재 비밀번호를 입력하세요"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message auth-error-message">
                {errors.currentPassword}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="newPassword" className="auth-label">
              새 비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`auth-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="새 비밀번호를 입력하세요"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {/* Backend-synced password strength meter */}
            {backendSync_showEntropyValidation && formData.newPassword && (
              <PasswordStrengthMeter
                password={formData.newPassword}
                userContext={{
                  registrationEmailValue: '',  // Would get from auth context
                  profileNameValue: ''
                }}
                showDetails={true}
                showCrackTime={true}
                showEntropyScore={true}
                showImprovementTips={true}
              />
            )}
            {errors.newPassword && (
              <span className="error-message auth-error-message">
                {errors.newPassword}
              </span>
            )}
            {/* Backend-synced validation feedback */}
            {backendSync_showEntropyValidation && formData.newPassword && (
              <ValidationFeedback
                fieldType="password"
                value={formData.newPassword}
                userContext={{
                  registrationEmailValue: '',
                  profileNameValue: ''
                }}
                debounceMs={300}
                showWarnings={true}
                showSuccessMessage={false}
              />
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">
              새 비밀번호 확인
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="새 비밀번호를 다시 입력하세요"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message auth-error-message">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button auth-button"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={`submit-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? '' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default PasswordChangeModal;