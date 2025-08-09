/**
 * Enhanced LoginPage with Client-side Validation
 * 
 * 기존 LoginPage를 보존하고 새로운 검증 시스템을 통합한 버전
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import StarBackground from '../../components/common/StarBackground';
import './LoginPage.css';

// 새로운 검증 시스템 import
import {
  validateLoginForm,
  ClientAuthFormValidationResult
} from '../../utils/clientAuthValidation';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface LoginFormMetadata {
  isEmailFormat?: boolean;
  hasValidationErrors?: boolean;
}

function LoginPageEnhanced(): React.ReactNode {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [metadata, setMetadata] = useState<LoginFormMetadata>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 실시간 검증 상태
  const [realtimeValidation, setRealtimeValidation] = useState<{
    username?: ClientAuthFormValidationResult;
    password?: ClientAuthFormValidationResult;
  }>({});
  
  // Refs for input focus
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  // Debounced values for validation
  const debouncedUsername = useDebounce(formData.username, 300);
  const debouncedPassword = useDebounce(formData.password, 300);

  // Get the redirect path from location state
  const from = location.state?.from?.pathname || '/users/me';

  // Focus on username field on mount
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Enhanced username validation
  useEffect(() => {
    if (!debouncedUsername) {
      setMetadata(prev => ({ ...prev, isEmailFormat: false }));
      return;
    }

    // Check if it's email format
    const isEmail = debouncedUsername.includes('@');
    setMetadata(prev => ({ ...prev, isEmailFormat: isEmail }));

    // Validate using the new system
    const validation = validateLoginForm(debouncedUsername, formData.password);
    setRealtimeValidation(prev => ({ 
      ...prev, 
      username: validation.username 
    }));
    
    // Update errors based on validation
    if (validation.username.fieldErrors.length > 0 && isEmail) {
      const error = validation.username.fieldErrors[0];
      // Only show format errors for email addresses
      if (error.errorCode.includes('FORMAT')) {
        setErrors(prev => ({ 
          ...prev, 
          username: '올바른 이메일 형식을 입력해주세요' 
        }));
      } else {
        setErrors(prev => ({ ...prev, username: undefined }));
      }
    } else {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  }, [debouncedUsername, formData.password]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Enhanced form validation
  const validateFormEnhanced = (): boolean => {
    const validation = validateLoginForm(formData.username, formData.password);
    
    const newErrors: LoginFormErrors = {};
    
    // Username validation
    if (validation.username.fieldErrors.length > 0) {
      const error = validation.username.fieldErrors[0];
      newErrors.username = error.errorMessage;
    }
    
    // Password validation
    if (validation.password.fieldErrors.length > 0) {
      const error = validation.password.fieldErrors[0];
      newErrors.password = error.errorMessage;
    }
    
    setErrors(newErrors);
    setMetadata(prev => ({ 
      ...prev, 
      hasValidationErrors: !validation.isFormValid 
    }));
    
    return validation.isFormValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error when user modifies any field
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
      await login({
        username: formData.username,
        password: formData.password
      });
      // 로그인 성공 시 AuthContext의 isAuthenticated가 true가 되면서
      // 위의 Navigate 컴포넌트가 자동으로 리다이렉트를 처리합니다
    } catch (error) {
      let errorMessage = '로그인에 실패했습니다';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 에러 메시지에 따른 구체적인 피드백
        if (errorMessage.includes('비밀번호')) {
          setErrors({
            password: errorMessage,
            general: '이메일 또는 비밀번호를 확인해주세요'
          });
        } else if (errorMessage.includes('이메일') || errorMessage.includes('사용자')) {
          setErrors({
            username: errorMessage,
            general: '이메일 또는 비밀번호를 확인해주세요'
          });
        } else if (errorMessage.includes('비활성화')) {
          setErrors({
            general: '계정이 비활성화되었습니다. 관리자에게 문의해주세요'
          });
        } else {
          setErrors({
            general: errorMessage
          });
        }
      } else {
        setErrors({
          general: errorMessage
        });
      }
      
      setIsSubmitting(false);
      
      // 실패 시 비밀번호 필드 포커스
      passwordRef.current?.focus();
      passwordRef.current?.select();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.currentTarget.name === 'username' && formData.username) {
        // Username 필드에서 Enter 시 password 필드로 이동
        passwordRef.current?.focus();
      } else if (e.currentTarget.name === 'password' && formData.password) {
        // Password 필드에서 Enter 시 폼 제출
        handleSubmit(e as any);
      }
    }
  };

  // Validation status indicator component
  const ValidationStatus = ({ field }: { field: 'username' | 'password' }) => {
    const validation = realtimeValidation[field];
    
    if (!validation || !formData[field]) return null;
    
    if (validation.isValid) {
      return <span className="input-status success">✓</span>;
    }
    
    if (validation.fieldWarnings && validation.fieldWarnings.length > 0) {
      return <span className="input-status warning">⚠</span>;
    }
    
    return null;
  };

  // Password strength hint
  const PasswordHint = () => {
    if (!showPassword || !formData.password || formData.password.length < 3) {
      return null;
    }
    
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    
    const strength = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    const strengthColors = ['#ff4444', '#ff9944', '#ffcc00', '#66cc66', '#44aa44'];
    const strengthLabels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    
    return (
      <div style={{ 
        fontSize: '11px', 
        color: strengthColors[strength],
        marginTop: '4px'
      }}>
        비밀번호 강도: {strengthLabels[strength]}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="login-page-loading">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="login-page auth-page">
      {/* 뒤로가기 버튼 */}
      <button 
        className="auth-back-button" 
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 별 배경 효과 */}
      <StarBackground />
      
      <div className="login-container auth-container auth-fade-in">
        <div className="login-brand">
          <div className="login-logo">AS</div>
        </div>
        
        <div className="login-header">
          <h1>로그인</h1>
          <p>AsyncSite에 오신 것을 환영합니다</p>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group auth-form-group">
            <label htmlFor="username" className="auth-label">
              이메일 또는 사용자명
              {metadata.isEmailFormat && (
                <span style={{ 
                  fontSize: '11px', 
                  color: '#666',
                  marginLeft: '8px'
                }}>
                  (이메일 형식 감지됨)
                </span>
              )}
            </label>
            <div className="input-with-status">
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`auth-input ${errors.username ? 'error' : ''}`}
                placeholder="example@email.com"
                autoComplete="username"
                disabled={isSubmitting}
                autoFocus
              />
              <ValidationStatus field="username" />
            </div>
            {errors.username && (
              <span className="error-message auth-error-message">
                {errors.username}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="password" className="auth-label">
              비밀번호
            </label>
            <div className="password-input-wrapper">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message auth-error-message">
                {errors.password}
              </span>
            )}
            <PasswordHint />
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password-link">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-button primary full-width"
            disabled={isSubmitting || !formData.username || !formData.password}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner-inline" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        {/* Social Login Options */}
        <div className="social-login-options">
          <button 
            className="social-login-button google"
            onClick={() => {
              // Google OAuth login
              window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/oauth/google`;
            }}
            disabled={isSubmitting}
          >
            <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="auth-footer">
          <p>
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="auth-link">
              회원가입
            </Link>
          </p>
        </div>

        {/* Additional security info */}
        {metadata.hasValidationErrors === false && formData.username && formData.password && (
          <div style={{
            marginTop: '16px',
            padding: '8px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#4CAF50',
            textAlign: 'center'
          }}>
            ✓ 입력 형식이 올바릅니다
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPageEnhanced;