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

// Simple timeout wrapper to avoid indefinite hanging on WebAuthn prompts
function withTimeout<T>(promise: Promise<T>, ms: number, onTimeoutMessage?: string): Promise<T> {
  let timer: any;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(onTimeoutMessage || 'TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

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
  console.log('[LoginPage] \ucef4\ud3ec\ub10c\ud2b8 \ub80c\ub354\ub9c1');
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  console.log('[LoginPage] \ucd08\uae30 location:', location);
  console.log('[LoginPage] \ucd08\uae30 isAuthenticated:', isAuthenticated);
  
  // Documento 서비스 감지 (변수명 충돌 방지를 위해 명확한 이름 사용)
  const documentoService = location.state?.service;
  console.log('[LoginPage] location.state:', location.state);
  console.log('[LoginPage] documentoService:', documentoService);
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
  // Unified flow state machine
  const [flowState, setFlowState] = useState<'idle' | 'starting' | 'authenticating' | 'awaitingOtp' | 'registering' | 'finishing' | 'success'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);
  
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

  // Get the redirect path from location state (문자열과 객체 모두 처리)
  console.log('[LoginPage] location.state?.from?.pathname:', location.state?.from?.pathname);
  console.log('[LoginPage] location.state?.from:', location.state?.from);
  const from = location.state?.from?.pathname || location.state?.from || '/users/me';
  console.log('[LoginPage] 최종 from 값:', from);
  console.log('[LoginPage] isAuthenticated:', isAuthenticated);

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log('[LoginPage] 이미 로그인됨, 리다이렉트:', from);
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
      console.log('[LoginPage] 로그인 시도, from:', from);
      console.log('[LoginPage] location.state 로그인 시도 시점:', location.state);
      await login({
        username: formData.username,
        password: formData.password
      });
      console.log('[LoginPage] 로그인 성공 후');
      
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
            console.log('[LoginPage] 패스키 있음, navigate to:', from);
            navigate(from, { replace: true });
          }
        } else {
          console.log('[LoginPage] webauthn 미지원, navigate to:', from);
          navigate(from, { replace: true });
        }
      } catch (profileError) {
        // 프로필 가져오기 실패해도 로그인은 성공이므로 이동
        console.log('[LoginPage] 프로필 에러, navigate to:', from);
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
    <div className={`login-page auth-page ${documentoService ? `login-page--${documentoService}` : ''}`}>
      {/* 뒤로가기 버튼 */}
      <button 
        className="auth-back-button" 
        onClick={() => navigate('/')}
        aria-label="홈으로 이동"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <StarBackground />
      <div className="login-container auth-container wide auth-fade-in">
        {/* Documento 서비스 브랜딩 표시 */}
        {documentoService && location.state?.branding && (
          <div className="documento-service-branding">
            <h2 className="documento-service-title">{location.state.branding.title}</h2>
            <p className="documento-service-subtitle">{location.state.branding.subtitle}</p>
          </div>
        )}
        <div className="login-brand"><Link to="/" className="login-logo" aria-label="홈으로 이동">AS</Link></div>
        <div className="login-header">
          <h1>로그인</h1>
        </div>
        {errors.general && (<div className="error-message general-error auth-error-shake">{errors.general}</div>)}

        {/* Nudge callout above tab navigation, pointing to Passkey tab */}
        <div className="nudge-callout nudge-callout--compact" aria-live="polite">
          패스키로 시작해보세요! <br />비밀번호를 서버에 저장하지 않고 안전하고 빨라요!
        </div>

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
              setOtpError('');
              setIsSubmitting(true);
              try {
                if (!formData.username || !formData.username.trim()) {
                  setErrors(prev => ({ ...prev, username: '이메일을 입력해주세요' }));
                  return;
                }
                setFlowState('starting');
                const startRes = await apiClient.post('/api/webauthn/start', { email: formData.username.trim() });
                const data = startRes.data.data;
                if (data.mode === 'authenticate') {
                  setFlowState('authenticating');
                  const assertion = await getPasskey(data.authOptions);
                  setFlowState('finishing');
                  const finishRes = await apiClient.post('/api/webauthn/finish', {
                    mode: 'authenticate',
                    email: formData.username.trim(),
                    webauthnPayload: {
                      id: assertion.id,
                      rawId: assertion.rawId,
                      clientDataJSON: assertion.response.clientDataJSON,
                      authenticatorData: assertion.response.authenticatorData,
                      signature: assertion.response.signature,
                      userHandle: assertion.response.userHandle
                    }
                  });
                  const loginResponse = finishRes.data.data;
                  authService.storeAuthData(loginResponse);
                  dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, {});
                  setFlowState('success');
                  console.log('[LoginPage] Passkey \ub85c\uadf8\uc778 \uc131\uacf5, navigate to:', from);
                  console.log('[LoginPage] Passkey \ub85c\uadf8\uc778 \uc2dc\uc810 location.state:', location.state);
                  navigate(from, { replace: true });
                } else {
                  // verifyEmailRequired
                  setFlowState('awaitingOtp');
                  // fire-and-forget send OTP
                  await apiClient.post('/api/webauthn/otp/start', { email: formData.username.trim() });
                }
              } catch (err: any) {
                const name = err?.name;
                if (name === 'NotAllowedError') {
                  setPasskeyError('취소했어요. 필요할 때 언제든 다시 시작할 수 있어요.');
                } else if (name === 'SecurityError') {
                  setPasskeyError('보안 도메인이 일치하지 않아요. https://asyncsite.com에서 다시 시도해 주세요.');
                } else if (err?.response?.data?.error?.code === 'SECURITY_ORIGIN_MISMATCH') {
                  setPasskeyError('보안상 현재 도메인과 맞지 않습니다. https://asyncsite.com에서 다시 시작해 주세요.');
                } else {
                  setPasskeyError('패스키 시작에 실패했습니다. 다시 시도해주세요.');
                }
                setFlowState('idle');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="auth-button auth-button-primary"
            type="button"
            aria-label="패스키로 시작하기"
            disabled={isSubmitting || !webauthnSupported}
          >
            {isSubmitting || (flowState !== 'idle' && flowState !== 'awaitingOtp') ? '진행 중...' : '🔐 패스키로 시작하기'}
          </button>
          {passkeyError && (
            <div className="auth-error" style={{ marginTop: 12, padding: 10, backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, color: '#856404', fontSize: 14, textAlign: 'center' }}>
              {passkeyError}
            </div>
          )}

          {flowState === 'awaitingOtp' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, color: '#ddd', marginBottom: 8 }}>이메일로 6자리 코드를 보냈어요</div>
              <div className="form-group auth-form-group">
                <label htmlFor="otp" className="auth-label">6자리 코드</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="auth-input"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isSubmitting}
                />
              </div>
              {otpError && <div className="auth-error" style={{ marginTop: 8 }}>{otpError}</div>}
              {otpInfo && !otpError && (
                <div className="auth-info" style={{ marginTop: 8, color: '#9be37b' }} aria-live="polite">{otpInfo}</div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="auth-button auth-button-secondary"
                  disabled={isSubmitting || otpCode.length !== 6}
                  onClick={async () => {
                    setIsSubmitting(true);
                    setOtpError('');
                    try {
                      const verifyRes = await apiClient.post('/api/webauthn/otp/verify', { email: formData.username.trim(), code: otpCode });
                      const data = verifyRes.data.data;
                      if (data?.mode === 'register') {
                        setFlowState('registering');
                        const credential = await withTimeout(
                          createPasskey(data.registerOptions),
                          30000,
                          '패스키 창 응답이 없어요. 다시 시도해 주세요.'
                        );
                        setFlowState('finishing');
                        const finishRes = await apiClient.post('/api/webauthn/finish', {
                          mode: 'register',
                          email: formData.username.trim(),
                          webauthnPayload: {
                            id: credential.id,
                            rawId: credential.rawId,
                            clientDataJSON: credential.response.clientDataJSON,
                            attestationObject: credential.response.attestationObject
                          }
                        });
                        const loginResponse = finishRes.data.data;
                        authService.storeAuthData(loginResponse);
                        dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, {});
                        setFlowState('success');
                        navigate(from, { replace: true });
                      }
                    } catch (err: any) {
                     // Ensure UI state recovers from registering/finishing back to OTP step
                     const backendCode = err?.response?.data?.error?.code;
                      if (err?.name === 'NotAllowedError') {
                       setOtpError('취소했어요. 필요할 때 언제든 다시 시도할 수 있어요.');
                      } else if (err?.name === 'SecurityError') {
                        setOtpError('보안 도메인이 일치하지 않아요. https://asyncsite.com에서 다시 시도해 주세요.');
                     } else if (backendCode === 'OTP_INVALID') {
                       setOtpError('코드가 올바르지 않아요. 다시 시도해 주세요.');
                     } else if (backendCode === 'OTP_EXPIRED') {
                       setOtpError('코드가 만료되었어요. 다시 요청해 주세요.');
                     } else if (backendCode === 'OTP_ATTEMPTS_EXCEEDED') {
                       setOtpError('시도 횟수를 초과했어요. 잠시 후 다시 시도해 주세요.');
                     } else if (backendCode === 'SECURITY_ORIGIN_MISMATCH') {
                       setOtpError('보안 도메인이 일치하지 않아요. https://asyncsite.com에서 다시 시도해 주세요.');
                     } else {
                       setOtpError('확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
                     }
                     setFlowState('awaitingOtp');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >코드 확인</button>
                <button
                  type="button"
                  className="auth-button"
                  disabled={isSubmitting || resendCooldown > 0}
                  onClick={async () => {
                    setOtpError('');
                    setOtpInfo('');
                    try {
                      setResendCooldown(30);
                      await apiClient.post('/api/webauthn/otp/start', { email: formData.username.trim() });
                      setOtpInfo('코드를 다시 보냈어요. 메일함을 확인해 주세요.');
                    } catch (err: any) {
                      const code = err?.response?.data?.error?.code;
                      if (code === 'OTP_RATE_LIMITED') {
                        setOtpError('요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.');
                      } else {
                        setOtpError('재전송에 실패했어요. 잠시 후 다시 시도해 주세요.');
                      }
                    }
                  }}
                >{resendCooldown > 0 ? `재전송 (${resendCooldown}s)` : '재전송'}</button>
              </div>
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
          <svg width="20" height="20" viewBox="0 0 533.5 544.3" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.7-36.3-4.9-53.6H272v101.4h146.9c-6.3 34-25 62.7-53.5 82v68.2h86.5c50.7-46.7 81.6-115.4 81.6-198z"/>
            <path fill="#34A853" d="M272 544.3c73.9 0 135.9-24.5 181.1-66.2l-86.5-68.2c-24.1 16.1-55 25.6-94.6 25.6-72.7 0-134.3-49-156.3-114.9H26.7v71.9C71.6 486.2 165.5 544.3 272 544.3z"/>
            <path fill="#FBBC05" d="M115.7 320.6c-10.9-32.7-10.9-68.2 0-100.9v-71.9H26.7C-8.9 196.4-8.9 348 26.7 420.6l89-70z"/>
            <path fill="#EA4335" d="M272 106.7c39.9 0 75.8 13.7 104.1 40.7l78.2-78.2C407.8 27.6 345.8 0 272 0 165.5 0 71.6 58.1 26.7 164.8l89 71.9C137.7 155.8 199.3 106.7 272 106.7z"/>
          </svg>
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