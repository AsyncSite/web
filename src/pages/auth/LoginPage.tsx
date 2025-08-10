import React, { useState, useEffect } from 'react';
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
import PasskeyPromptModal from '../../components/auth/PasskeyPromptModal';

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
  const [webauthnSupported, setWebauthnSupported] = useState<boolean>(false);
  const [passkeyError, setPasskeyError] = useState<string | React.ReactNode>('');
  const [tab, setTab] = useState<'passkey' | 'password'>('passkey');
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
  const [conditionalUISupported, setConditionalUISupported] = useState(false);
  
  React.useEffect(() => {
    // WebAuthn 지원 체크
    setWebauthnSupported(typeof window !== 'undefined' && !!(navigator as any).credentials?.create);
    
    // Conditional UI 지원 체크
    if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
      (async () => {
        try {
          // Conditional UI 지원 여부 확인
          const available = await (PublicKeyCredential as any).isConditionalMediationAvailable?.();
          if (available) {
            setConditionalUISupported(true);
            // Chrome/Edge가 username 필드에서 자동으로 패스키를 제안합니다
            // autocomplete="username webauthn" 속성이 이미 추가되어 있으므로
            // 사용자가 입력 필드를 클릭하면 브라우저가 처리합니다
          }
        } catch (err) {
          console.log('Conditional UI not supported:', err);
        }
      })();
    }
  }, []);

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

  // 패스키 등록 여부 확인 함수
  const checkPasskeyRegistration = async (email: string) => {
    try {
      // /api/webauthn/auth/options 엔드포인트로 확인
      const response = await apiClient.post('/api/webauthn/auth/options', { 
        username: email 
      });
      const options = response.data.data;
      // allowCredentials가 비어있으면 패스키 미등록
      return options.allowCredentials && options.allowCredentials.length > 0;
    } catch (error) {
      console.error('Failed to check passkey registration:', error);
      return false;
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
      
      // 로그인 성공 후 사용자 정보 가져오기
      try {
        const profileResponse = await userService.getProfile();
        if (profileResponse && webauthnSupported) {
          const hasPasskey = await checkPasskeyRegistration(formData.username);
          
          if (!hasPasskey) {
            // 패스키가 없으면 프롬프트 표시
            setUserInfo({
              email: formData.username,
              name: profileResponse.name || formData.username
            });
            setShowPasskeyPrompt(true);
            
            // 3초 후 자동으로 페이지 이동 (모달이 닫히지 않았다면)
            setTimeout(() => {
              if (showPasskeyPrompt) {
                navigate(from, { replace: true });
              }
            }, 3000);
          } else {
            // 패스키가 있으면 바로 이동
            navigate(from, { replace: true });
          }
        } else {
          navigate(from, { replace: true });
        }
      } catch (profileError) {
        // 프로필 가져오기 실패해도 로그인은 성공이므로 이동
        navigate(from, { replace: true });
      }
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
      <StarBackground />
      <div className="login-container auth-container auth-fade-in">
        <div className="login-brand"><div className="login-logo">AS</div></div>
        <div className="login-header">
          <h1>로그인</h1>
          <p>원하는 방법을 선택하세요</p>
        </div>
        {errors.general && (<div className="error-message general-error auth-error-shake">{errors.general}</div>)}

        {/* Tabs: Passkey / Email+Password */}
        <div className="tab-navigation" style={{ marginBottom: 12 }}>
          <button className={`tab-button ${tab === 'passkey' ? 'active' : ''}`} onClick={() => setTab('passkey')}>🔐 패스키</button>
          <button className={`tab-button ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>이메일+비밀번호</button>
        </div>

        {/* Passkey pane */}
        {tab === 'passkey' && (
        <div className="tab-content">
          <div className="form-group auth-form-group">
            <label htmlFor="username" className="auth-label">이메일</label>
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
            {errors.username && (<span className="error-message auth-error-message">{errors.username}</span>)}
          </div>
          <button
            onClick={async () => {
              setPasskeyError('');
              setIsSubmitting(true);
              try {
                if (!formData.username || !formData.username.trim()) {
                  setErrors(prev => ({ ...prev, username: '이메일을 입력해주세요' }));
                  return;
                }
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
                setPasskeyError(err?.name === 'NotAllowedError' ? '패스키 인증이 취소되었습니다.' : '패스키 로그인에 실패했습니다. 다시 시도해주세요.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="auth-button auth-button-primary"
            type="button"
            aria-label="Passkey로 로그인"
            disabled={isSubmitting}
          >
            {isSubmitting ? '인증 중...' : '🔐 패스키로 로그인'}
          </button>
          {passkeyError && (
            <div className="auth-error" style={{ marginTop: 12, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, color: '#856404', fontSize: 14, textAlign: 'center' }}>
              {passkeyError}
            </div>
          )}
        </div>
        )}

        {/* Email+Password pane */}
        {tab === 'password' && (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group auth-form-group">
            <label htmlFor="username2" className="auth-label">이메일</label>
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
            {errors.username && (<span className="error-message auth-error-message">{errors.username}</span>)}
          </div>
          <div className="form-group auth-form-group">
            <label htmlFor="password" className="auth-label">비밀번호</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            {errors.password && (<span className="error-message auth-error-message">{errors.password}</span>)}
          </div>
          <button type="submit" className={`auth-button auth-button-secondary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? '' : '이메일+비밀번호로 로그인'}
          </button>
        </form>
        )}

        <div className="login-divider"><span>또는</span></div>
        <button onClick={() => window.location.href = `${env.apiBaseUrl}/api/auth/oauth/google/login`} className="google-login-button auth-button" type="button" aria-label="Google 계정으로 로그인" disabled={isSubmitting}>
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

export default LoginPage;