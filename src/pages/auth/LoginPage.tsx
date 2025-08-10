import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StarBackground from '../../components/common/StarBackground';
import { env } from '../../config/environment';
import './LoginPage.css';
import { createPasskey, getPasskey } from '../../utils/webauthn/helpers';
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
              이메일
            </label>
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

        <div className="login-divider">
          <span>또는</span>
        </div>

        <button
          onClick={() => window.location.href = `${env.apiBaseUrl}/api/auth/oauth/google/login`}
          className="google-login-button auth-button"
          type="button"
          aria-label="Google 계정으로 로그인"
          disabled={isSubmitting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Google로 계속하기</span>
        </button>

        {webauthnSupported && (
          <>
            <div className="login-divider">
              <span>또는</span>
            </div>
            <button
              onClick={async () => {
                setPasskeyError(''); // 이전 에러 초기화
                setIsSubmitting(true);
                
                try {
                  // Enforce directed flow: require email to align with server challenge storage
                  if (!formData.username || !formData.username.trim()) {
                    setErrors(prev => ({ ...prev, username: '이메일을 입력해주세요' }));
                    return;
                  }
                  // 1) 요청 옵션 가져오기
                  const optionsRes = await apiClient.post('/api/webauthn/auth/options', { 
                    username: formData.username 
                  });
                  const options = optionsRes.data.data;
                  
                  // 2) get 호출
                  const assertion = await getPasskey(options);
                  
                  // 3) 검증 요청
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
                  console.error('Passkey login failed', err);
                  
                  // 에러 메시지 처리
                  if (err?.name === 'NotAllowedError') {
                    setPasskeyError('패스키 인증이 취소되었습니다.');
                  } else if (err?.message?.includes('No available authenticator') || 
                             err?.name === 'InvalidStateError') {
                    setPasskeyError(
                      <>
                        이 기기에 등록된 패스키가 없습니다.
                        <br />
                        <Link to="/signup" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                          회원가입
                        </Link>
                        {' '}페이지에서 먼저 패스키를 등록해주세요.
                      </>
                    );
                  } else {
                    setPasskeyError('패스키 로그인에 실패했습니다. 다시 시도해주세요.');
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="auth-button auth-button-secondary"
              type="button"
              aria-label="Passkey로 로그인"
              disabled={isSubmitting}
            >
              {isSubmitting ? '인증 중...' : '🔐 Passkey로 로그인'}
            </button>
            
            {passkeyError && (
              <div className="auth-error" style={{ 
                marginTop: '12px', 
                padding: '10px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                color: '#856404',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {passkeyError}
              </div>
            )}
            
          </>
        )}

        <div className="login-footer">
          <p style={{ marginBottom: '12px' }}>
            계정이 없으신가요?{' '}
            <Link to="/signup" className="signup-link">
              회원가입
            </Link>
          </p>
          <Link 
            to="/forgot-password"
            className="forgot-password-link"
            style={{ fontSize: '13px', color: '#999' }}
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>
      
      {/* 패스키 등록 유도 모달 */}
      {userInfo && (
        <PasskeyPromptModal
          isOpen={showPasskeyPrompt}
          onClose={() => {
            setShowPasskeyPrompt(false);
            navigate(from, { replace: true });
          }}
          userEmail={userInfo.email}
          userName={userInfo.name}
        />
      )}
    </div>
  );
}

export default LoginPage;