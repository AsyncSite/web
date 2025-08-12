import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import StarBackground from '../../components/common/StarBackground';
import apiClient from '../../api/client';
import './auth-common.css';
import './ResetPasswordPage.css';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface TokenInfo {
  email: string;
  remainingMinutes: number;
  isValid: boolean;
}

function ResetPasswordPage(): React.ReactNode {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setErrors({ general: '유효하지 않은 링크입니다.' });
      setIsVerifying(false);
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await apiClient.get('/api/auth/password-reset/verify-token', {
          params: { token }
        });
        
        const data = response.data;
        
        if (!data.success) {
          throw new Error(data.error?.message || '토큰 검증에 실패했습니다');
        }

        if (!data.data.isValid) {
          throw new Error('토큰이 만료되었거나 이미 사용되었습니다');
        }

        setTokenInfo(data.data);
      } catch (error) {
        // 기술적인 에러 메시지는 콘솔에만 로깅
        if (error instanceof Error && error.message.includes('Failed to')) {
          console.error('Technical error:', error);
          setErrors({
            general: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          });
        } else {
          setErrors({
            general: error instanceof Error ? error.message : '토큰 검증 중 오류가 발생했습니다'
          });
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다';
    }
    if (!/[A-Z]/.test(password)) {
      return '비밀번호는 대문자를 포함해야 합니다';
    }
    if (!/[a-z]/.test(password)) {
      return '비밀번호는 소문자를 포함해야 합니다';
    }
    if (!/[0-9]/.test(password)) {
      return '비밀번호는 숫자를 포함해야 합니다';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: ResetPasswordFormErrors = {};

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ResetPasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await apiClient.post('/api/auth/password-reset/reset', {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error?.message || '비밀번호 재설정에 실패했습니다');
      }

      setIsSuccess(true);
    } catch (error) {
      // 기술적인 에러 메시지는 콘솔에만 로깅
      if (error instanceof Error && error.message.includes('Failed to')) {
        console.error('Technical error:', error);
        setErrors({
          general: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      } else {
        setErrors({
          general: error instanceof Error ? error.message : '비밀번호 재설정 중 오류가 발생했습니다'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-verifying-page auth-page">
        <StarBackground />
        <div className="reset-password-verifying-container auth-container">
          <div className="reset-password-verifying-card">
            <div className="reset-password-verifying-header">
              <h1 className="reset-password-verifying-title">토큰 검증 중...</h1>
              <p className="reset-password-verifying-subtitle">잠시만 기다려주세요.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="reset-password-success-page auth-page">
        <StarBackground />
        <div className="reset-password-success-container auth-container">
          <div className="reset-password-success-card">
            <div className="reset-password-success-header">
              <h1 className="reset-password-success-title">비밀번호가 변경되었습니다</h1>
              <p className="reset-password-success-subtitle">
                새로운 비밀번호로 로그인해주세요.
              </p>
            </div>

            <div className="reset-password-success-action-group">
              <Link 
                to="/login" 
                className="reset-password-success-login-button auth-button auth-button-primary"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.general && !tokenInfo) {
    return (
      <div className="reset-password-error-page auth-page">
        <StarBackground />
        <div className="reset-password-error-container auth-container">
          <div className="reset-password-error-card">
            <div className="reset-password-error-header">
              <h1 className="reset-password-error-title">오류가 발생했습니다</h1>
              <p className="reset-password-error-message">
                {errors.general}
              </p>
            </div>

            <div className="reset-password-error-action-group">
              <Link 
                to="/forgot-password" 
                className="reset-password-error-retry-button auth-button auth-button-primary"
              >
                비밀번호 재설정 다시 요청하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-form-page auth-page">
      <StarBackground />
      
      {/* 뒤로가기 버튼 */}
      <button 
        className="reset-password-back-button auth-back-button" 
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="reset-password-form-container auth-container">
        <div className="reset-password-form-card">
          <div className="reset-password-form-header">
            <h1 className="reset-password-form-title">새 비밀번호 설정</h1>
            <p className="reset-password-form-subtitle">
              {tokenInfo && (
                <>
                  <span className="reset-password-email-info">{tokenInfo.email}</span> 계정의 새로운 비밀번호를 입력해주세요.
                  <br />
                  <span className="reset-password-time-warning">
                    남은 시간: {tokenInfo.remainingMinutes}분
                  </span>
                </>
              )}
            </p>
          </div>

          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="reset-password-new-password-group auth-form-group">
              <label htmlFor="reset-password-new-input" className="reset-password-new-label auth-label">
                새 비밀번호
              </label>
              <div className="reset-password-input-wrapper auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reset-password-new-input"
                  name="newPassword"
                  className={`reset-password-new-input auth-input ${errors.newPassword ? 'auth-input-error' : ''}`}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="8자 이상, 대소문자 및 숫자 포함"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="reset-password-toggle-button auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  {showPassword ? '숨기기' : '표시'}
                </button>
              </div>
              {errors.newPassword && (
                <span className="reset-password-new-error auth-error-message">
                  {errors.newPassword}
                </span>
              )}
            </div>

            <div className="reset-password-confirm-password-group auth-form-group">
              <label htmlFor="reset-password-confirm-input" className="reset-password-confirm-label auth-label">
                비밀번호 확인
              </label>
              <div className="reset-password-input-wrapper auth-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="reset-password-confirm-input"
                  name="confirmPassword"
                  className={`reset-password-confirm-input auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="reset-password-toggle-button auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  {showConfirmPassword ? '숨기기' : '표시'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="reset-password-confirm-error auth-error-message">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="reset-password-form-error-banner auth-error-banner">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="reset-password-submit-button auth-button auth-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>

          <div className="reset-password-form-footer">
            <p className="reset-password-form-footer-text auth-footer-text">
              도움이 필요하신가요?{' '}
              <Link to="/forgot-password" className="reset-password-help-link auth-link">
                비밀번호 재설정 다시 요청
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;