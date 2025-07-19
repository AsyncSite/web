import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
      // 로그인 성공 후 명시적으로 navigate
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : '로그인에 실패했습니다'
      });
    } finally {
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
      {/* 움직이는 별 배경 */}
      <div className="auth-stars">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="auth-star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* 별똥별 효과 */}
      <div className="auth-shooting-stars">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="auth-shooting-star"
            style={{
              animationDelay: `${i * 4 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      
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
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
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