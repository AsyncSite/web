import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarBackground from '../../components/common/StarBackground';
import { env } from '../../config/environment';
import './auth-common.css';
import './ForgotPasswordPage.css';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

function ForgotPasswordPage(): React.ReactNode {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ForgotPasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${env.apiBaseUrl}/api/auth/password-reset/reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        // JSON 파싱 시도, 실패하면 기본 메시지
        let errorMessage = '요청 처리 중 오류가 발생했습니다';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // JSON 파싱 실패 시 상태 코드에 따른 메시지
          if (response.status === 401) {
            errorMessage = '인증 오류가 발생했습니다. 서버 설정을 확인해주세요.';
          } else if (response.status === 403) {
            errorMessage = '요청이 거부되었습니다. 잠시 후 다시 시도해주세요.';
          } else if (response.status === 404) {
            errorMessage = '등록되지 않은 이메일입니다.';
          } else if (response.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }
        }
        throw new Error(errorMessage);
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
          general: error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-success-page auth-page">
        <StarBackground />
        <div className="forgot-password-success-container auth-container">
          <div className="forgot-password-success-card">
            <div className="forgot-password-success-header">
              <h1 className="forgot-password-success-title">이메일을 확인해주세요</h1>
              <p className="forgot-password-success-subtitle">
                등록된 이메일인 경우 비밀번호 재설정 링크가 발송되었습니다.
                <br />
                메일함을 확인해주세요.
              </p>
            </div>

            <div className="forgot-password-success-action-group">
              <Link 
                to="/login" 
                className="forgot-password-success-return-button auth-button auth-button-primary"
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>

            <div className="forgot-password-success-footer">
              <p className="forgot-password-success-footer-text">
                이메일을 받지 못하셨나요?
                <br />
                스팸 메일함을 확인하거나 잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-request-page auth-page">
      <StarBackground />
      
      {/* 뒤로가기 버튼 */}
      <button 
        className="forgot-password-back-button auth-back-button" 
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="forgot-password-request-container auth-container">
        <div className="forgot-password-request-card">
          <div className="forgot-password-request-header">
            <h1 className="forgot-password-request-title">비밀번호 재설정</h1>
            <p className="forgot-password-request-subtitle">
              가입하신 이메일 주소를 입력해주세요.
              <br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form className="forgot-password-request-form" onSubmit={handleSubmit}>
            <div className="forgot-password-request-form-group auth-form-group">
              <label htmlFor="forgot-password-email-input" className="forgot-password-request-label auth-label">
                이메일
              </label>
              <input
                type="email"
                id="forgot-password-email-input"
                name="email"
                className={`forgot-password-request-email-input auth-input ${errors.email ? 'auth-input-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="forgot-password-request-error-message auth-error-message">
                  {errors.email}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="forgot-password-request-error-banner auth-error-banner">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="forgot-password-request-submit-button auth-button auth-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '전송 중...' : '재설정 링크 전송'}
            </button>
          </form>

          <div className="forgot-password-request-footer">
            <p className="forgot-password-request-footer-text auth-footer-text">
              비밀번호를 기억하셨나요?{' '}
              <Link to="/login" className="forgot-password-request-login-link auth-link">
                로그인
              </Link>
            </p>
            <p className="forgot-password-request-footer-text auth-footer-text">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="forgot-password-request-signup-link auth-link">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;