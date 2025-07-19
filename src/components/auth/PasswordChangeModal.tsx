import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: PasswordFormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
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

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return { strength: '약함', color: 'var(--auth-text-error)' };
    if (strength <= 4) return { strength: '보통', color: 'var(--auth-accent-pink)' };
    return { strength: '강함', color: 'var(--auth-text-success)' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

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
            {formData.newPassword && (
              <div className="password-strength" style={{ color: passwordStrength.color }}>
                비밀번호 강도: {passwordStrength.strength}
              </div>
            )}
            {errors.newPassword && (
              <span className="error-message auth-error-message">
                {errors.newPassword}
              </span>
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