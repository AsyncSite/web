import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StarBackground from '../../components/common/StarBackground';
import { env } from '../../config/environment';
import './LoginPage.css';
import { getPasskey } from '../../utils/webauthn/helpers';
import apiClient from '../../api/client';
import authService from '../../api/authService';
import userService from '../../api/userService';
import { AUTH_EVENTS, dispatchAuthEvent } from '../../utils/authEvents';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

// Prototype B: Tabs (Passkey / Email+Password)
function LoginPageB(): React.ReactNode {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'passkey' | 'password'>('passkey');
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webauthnSupported, setWebauthnSupported] = useState<boolean>(false);

  useEffect(() => {
    setWebauthnSupported(typeof window !== 'undefined' && !!(navigator as any).credentials?.create);
  }, []);

  const from = location.state?.from?.pathname || '/users/me';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePasskeyLogin = async () => {
    const newErrors: LoginFormErrors = {};
    if (!formData.username.trim()) newErrors.username = '이메일을 입력해주세요';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const optionsRes = await apiClient.post('/api/webauthn/auth/options', { username: formData.username });
      const options = optionsRes.data.data;
      const assertion = await getPasskey(options);
      const verifyRes = await apiClient.post('/api/webauthn/auth/verify', {
        username: formData.username,
        id: assertion.id,
        rawId: assertion.rawId,
        response: {
          clientDataJSON: assertion.response.clientDataJSON,
          authenticatorData: assertion.response.authenticatorData,
          signature: assertion.response.signature,
          userHandle: assertion.response.userHandle
        }
      });
      const loginResponse = verifyRes.data.data;
      authService.storeAuthData(loginResponse);
      dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, {});
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? '패스키 인증이 취소되었습니다.'
        : '패스키 로그인에 실패했습니다. 다시 시도해주세요.';
      setErrors({ general: msg });
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: LoginFormErrors = {};
    if (!formData.username.trim()) newErrors.username = '이메일을 입력해주세요';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({ username: formData.username, password: formData.password });
      const profile = await userService.getProfile().catch(() => null);
      if (profile) navigate(from, { replace: true });
      else navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({ general: error?.message || '로그인에 실패했습니다' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page auth-page">
      <StarBackground />

      <div className="login-container auth-container auth-fade-in">
        <div className="login-brand"><div className="login-logo">AS</div></div>
        <div className="login-header">
          <h1>로그인</h1>
          <p>원하는 방법을 선택하세요</p>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">{errors.general}</div>
        )}

        {/* Tabs */}
        <div className="tab-navigation" style={{ marginBottom: 12 }}>
          <button className={`tab-button ${tab === 'passkey' ? 'active' : ''}`} onClick={() => setTab('passkey')}>
            🔐 패스키
          </button>
          <button className={`tab-button ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            이메일+비밀번호
          </button>
        </div>

        {tab === 'passkey' && (
          <div className="tab-content">
            <div className="form-group auth-form-group">
              <label className="auth-label" htmlFor="username">이메일</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`auth-input ${errors.username ? 'error' : ''}`}
                placeholder="example@email.com"
                autoComplete="username webauthn"
                disabled={isSubmitting}
              />
              {errors.username && <span className="error-message auth-error-message">{errors.username}</span>}
            </div>

            {webauthnSupported ? (
              <button
                onClick={handlePasskeyLogin}
                className="auth-button auth-button-primary"
                type="button"
                aria-label="Passkey로 로그인"
                disabled={isSubmitting}
              >
                {isSubmitting ? '인증 중...' : '🔐 패스키로 로그인'}
              </button>
            ) : (
              <div className="auth-info-message">이 브라우저에서는 패스키를 사용할 수 없습니다.</div>
            )}
          </div>
        )}

        {tab === 'password' && (
          <div className="tab-content">
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="form-group auth-form-group">
                <label className="auth-label" htmlFor="username2">이메일</label>
                <input
                  type="text"
                  id="username2"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`auth-input ${errors.username ? 'error' : ''}`}
                  placeholder="example@email.com"
                  autoComplete="username"
                  disabled={isSubmitting}
                />
                {errors.username && <span className="error-message auth-error-message">{errors.username}</span>}
              </div>

              <div className="form-group auth-form-group">
                <label className="auth-label" htmlFor="password">비밀번호</label>
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
                {errors.password && <span className="error-message auth-error-message">{errors.password}</span>}
              </div>

              <button type="submit" className={`auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? '' : '로그인'}
              </button>
            </form>
          </div>
        )}

        <div className="login-divider"><span>또는</span></div>

        <button
          onClick={() => (window.location.href = `${env.apiBaseUrl}/api/auth/oauth/google/login`)}
          className="google-login-button auth-button"
          type="button"
          aria-label="Google 계정으로 로그인"
          disabled={isSubmitting}
        >
          <span>Google로 계속하기</span>
        </button>

        <div className="login-footer">
          <p style={{ marginBottom: '12px' }}>계정이 없으신가요? <Link to="/signup" className="signup-link">회원가입</Link></p>
          <Link to="/forgot-password" className="forgot-password-link" style={{ fontSize: '13px', color: '#999' }}>
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPageB;
