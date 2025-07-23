import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StarBackground from '../../components/common/StarBackground';
import './LoginPage.css';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

function LoginPage(): React.ReactNode {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get the redirect path from location state
  const from = location.state?.from?.pathname || '/users/me';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '이메일 또는 사용자명을 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({
        username: formData.username,
        password: formData.password
      });
      // 로그인 성공 시 AuthContext의 isAuthenticated가 true가 되면서
      // 위의 Navigate 컴포넌트가 자동으로 리다이렉트를 처리합니다
      // 따라서 여기서는 추가 navigate 호출이 필요 없습니다
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : '로그인에 실패했습니다'
      });
      setIsSubmitting(false);
    }
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
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`auth-input ${errors.username ? 'error' : ''}`}
              placeholder="example@email.com"
              autoComplete="username"
              disabled={isSubmitting}
            />
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
            <div className="input-wrapper password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L21 21M10.5 10.5C10.5 9.67157 11.1716 9 12 9C12.8284 9 13.5 9.67157 13.5 10.5M10.5 10.5C10.5 11.3284 11.1716 12 12 12C12.8284 12 13.5 11.3284 13.5 10.5M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.93 4.93C3.12 6.27 2 8.07 2 10C2 14 7 19 12 19C13.93 19 15.73 18.39 17.27 17.38M9.58 9.58C9.22 9.94 9 10.45 9 11C9 12.1 9.9 13 11 13C11.55 13 12.06 12.78 12.42 12.42M19.07 19.07C20.88 17.73 22 15.93 22 14C22 10 17 5 12 5C10.07 5 8.27 5.61 6.73 6.62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5C7 5 2 10 2 14C2 18 7 23 12 23C17 23 22 18 22 14C22 10 17 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message auth-error-message">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`login-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="signup-link">
              회원가입
            </Link>
          </p>
          <div className="additional-links">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('비밀번호 찾기 기능은 준비 중입니다.'); }}>
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;