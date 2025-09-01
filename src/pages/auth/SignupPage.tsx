import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import userService from '../../api/userService';
import StarBackground from '../../components/common/StarBackground';
import { ValidationFeedback } from '../../components/common/validation';
import { registrationEmailValidator, profileNameValidator } from '../../utils/clientAuthValidation';
import { env } from '../../config/environment';
import { createPasskey, getPasskey } from '../../utils/webauthn/helpers';
import apiClient from '../../api/client';
import PasskeyPromptModal from '../../components/auth/PasskeyPromptModal';
import ProfileOnboardingModal from '../../components/auth/ProfileOnboardingModal';
import authService from '../../api/authService';
import { AUTH_EVENTS, dispatchAuthEvent } from '../../utils/authEvents';
import './auth-common.css';
import './SignupPage.css';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface SignupFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
}

type SignupStep = 'email' | 'name' | 'password' | 'confirmPassword';
type SignupMethod = 'google' | 'email' | 'passkey' | null;

function SignupPage(): React.ReactNode {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>(null);
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [completedSteps, setCompletedSteps] = useState<SignupStep[]>([]);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckTriggered, setEmailCheckTriggered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [webauthnSupported, setWebauthnSupported] = useState<boolean>(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [showProfileOnboarding, setShowProfileOnboarding] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // Minimal password UX flags
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordNextAttempted, setPasswordNextAttempted] = useState(false);
  
  // Backend sync validation states
  const [backendSync_emailValidationResult, setBackendSync_emailValidationResult] = useState<any>(null);
  const [backendSync_showAdvancedValidation, setBackendSync_showAdvancedValidation] = useState(true); // Always enabled in production
  
  // Debounce email value for API calls
  const debouncedEmail = useDebounce(formData.email, 500);
  
  // Refs for input focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // WebAuthn support check
  useEffect(() => {
    setWebauthnSupported(typeof window !== 'undefined' && !!(navigator as any).credentials?.create);
  }, []);

  // Focus management
  useEffect(() => {
    if (signupMethod === 'email') {
      switch (currentStep) {
        case 'email':
          emailRef.current?.focus();
          break;
        case 'name':
          nameRef.current?.focus();
          break;
        case 'password':
          passwordRef.current?.focus();
          break;
        case 'confirmPassword':
          confirmPasswordRef.current?.focus();
          break;
      }
    }
  }, [currentStep, signupMethod]);

  // Check email availability with debounced value
  useEffect(() => {
    if (!debouncedEmail || !emailCheckTriggered) {
      setEmailAvailable(null);
      return;
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(debouncedEmail)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요' });
      setEmailAvailable(null);
      return;
    }

    const checkEmail = async () => {
      setIsCheckingEmail(true);
      setErrors({});
      
      try {
        const isAvailable = await userService.checkEmailAvailability(debouncedEmail);
        setEmailAvailable(isAvailable);
        
        if (!isAvailable) {
          setErrors({ email: '이미 사용 중인 이메일입니다' });
        }
      } catch (error) {
        setErrors({ email: '이메일 확인 중 오류가 발생했습니다' });
        setEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    checkEmail();
  }, [debouncedEmail, emailCheckTriggered]);

  // Auto-proceed to next step when email is available
  useEffect(() => {
    if (emailAvailable === true && currentStep === 'email' && !completedSteps.includes('email')) {
      setCompletedSteps([...completedSteps, 'email']);
      setCurrentStep('name');
    }
  }, [emailAvailable, currentStep, completedSteps]);

  // Redirect if already authenticated and should redirect - MUST be after all hooks
  if (isAuthenticated && shouldRedirect) {
    const redirectTo = location.state?.from || '/users/me';
    return <Navigate to={redirectTo} replace />;
  }

  // Check email availability button handler
  const checkEmailAvailability = () => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요' });
      return;
    }

    // If already checked and available, move to next step
    if (emailAvailable === true && !isCheckingEmail) {
      if (!completedSteps.includes('email')) {
        setCompletedSteps([...completedSteps, 'email']);
        setCurrentStep('name');
      }
    } else {
      // Trigger email check
      setEmailCheckTriggered(true);
    }
  };

  const validateStep = (step: SignupStep): boolean => {
    const newErrors: SignupFormErrors = {};

    switch (step) {
      case 'email':
        // Prefer a single phrasing for invalid format
        const simpleEmailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!formData.email.trim()) {
          newErrors.email = '이메일을 입력해주세요';
        } else if (!simpleEmailRegex.test(formData.email)) {
          newErrors.email = '올바른 이메일 형식을 입력해주세요';
        } else {
          // Use backend-synced validation only if format is valid
          const backendSync_emailResult = registrationEmailValidator.validateRegistrationEmail(formData.email);
          if (!backendSync_emailResult.isValid && backendSync_emailResult.fieldErrors.length > 0) {
            newErrors.email = backendSync_emailResult.fieldErrors[0].errorMessage;
          }
          setBackendSync_emailValidationResult(backendSync_emailResult);
        }
        break;
        
      case 'name':
        // Use backend-synced validation
        const backendSync_nameResult = profileNameValidator.validateProfileName(formData.name);
        if (!formData.name.trim()) {
          newErrors.name = '이름을 입력해주세요';
        } else if (!backendSync_nameResult.isValid && backendSync_nameResult.fieldErrors.length > 0) {
          newErrors.name = backendSync_nameResult.fieldErrors[0].errorMessage;
        }
        break;
        
      case 'password':
        // Minimal rule: show only length error
        if (!formData.password) {
          newErrors.password = '비밀번호를 입력해주세요';
        } else if (formData.password.length < 8) {
          newErrors.password = '8자 이상 입력해주세요';
        }
        break;
        
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepComplete = (step: SignupStep) => {
    if (validateStep(step)) {
      if (!completedSteps.includes(step)) {
        setCompletedSteps([...completedSteps, step]);
      }
      
      // Move to next step (depend on signup method)
      const steps: SignupStep[] = signupMethod === 'passkey'
        ? ['email', 'name']
        : ['email', 'name', 'password', 'confirmPassword'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {};

    // Email validation
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    // Password validation (minimal): only length
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '8자 이상 입력해주세요';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '이름은 2자 이상 50자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Trigger email check when user types in email field
    if (name === 'email' && currentStep === 'email') {
      setEmailCheckTriggered(true);
      setEmailAvailable(null);
    }
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Reset email availability status when email changes
    if (name === 'email') {
      setEmailAvailable(null);
      // Clear email-related errors
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
      // Remove email from completed steps if it was completed
      // But keep other completed steps intact
      if (completedSteps.includes('email')) {
        setCompletedSteps(prev => prev.filter(step => step !== 'email'));
        // Reset current step to email only if we're past email step
        if (currentStep !== 'email') {
          setCurrentStep('email');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      
      setRegistrationCompleted(true);
      
      // WebAuthn 지원 여부 확인 후 패스키 모달 표시
      if (webauthnSupported) {
        setShowPasskeyPrompt(true);
        setIsSubmitting(false);
      } else {
        // WebAuthn 미지원 시 프로필 온보딩 모달 표시
        setShowProfileOnboarding(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      // The error message is already translated by handleApiError
      // Check if it's an email-related error
      if (message.includes('이메일')) {
        setErrors({ email: message });
      } else {
        setErrors({ general: message });
      }
      // 에러 발생 시에만 isSubmitting을 false로 설정
      setIsSubmitting(false);
    }
  };

  // Passkey-only signup (email + name, no password)
  const handlePasskeySignup = async () => {
    // Validate email and name only
    const emailValid = validateStep('email');
    const nameValid = validateStep('name');
    if (!emailValid || !nameValid) return;

    if (!webauthnSupported) {
      setErrors({ general: '이 브라우저는 패스키를 지원하지 않습니다. 다른 브라우저에서 시도해주세요.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      // 1) Registration options
      const regOptionsRes = await apiClient.post('/api/webauthn/register/options', {
        userId: formData.email,
        username: formData.email,
        displayName: formData.name || formData.email
      });
      const regOptions = regOptionsRes.data.data;

      // 2) Create credential
      const credential = await createPasskey(regOptions);

      // 3) Verify registration
      await apiClient.post('/api/webauthn/register/verify', {
        userId: formData.email,
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          attestationObject: credential.response.attestationObject
        }
      });

      // 4) Immediately authenticate to issue JWT
      const authOptionsRes = await apiClient.post('/api/webauthn/auth/options', {
        username: formData.email
      });
      const authOptions = authOptionsRes.data.data;
      const assertion = await getPasskey(authOptions);

      const verifyRes = await apiClient.post('/api/webauthn/auth/verify', {
        username: formData.email,
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
      
      // 패스키 가입 완료 후 프로필 온보딩 모달 표시
      setRegistrationCompleted(true);
      setShowProfileOnboarding(true);
    } catch (err: any) {
      console.error('Passkey signup failed', err);
      if (err?.name === 'NotAllowedError') {
        setErrors({ general: '패스키 등록이 취소되었습니다. 다시 시도해주세요.' });
      } else if (err?.message?.includes('relying party') || err?.message?.includes('origin')) {
        setErrors({ general: '보안 설정(rpId/origin)과 현재 도메인이 일치하지 않습니다. HTTPS 환경에서 다시 시도해주세요.' });
      } else {
        setErrors({ general: '패스키 가입에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="signup-page-loading">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="signup-page auth-page">
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
      
      <div className="signup-container auth-container wide auth-fade-in">
        <div className="signup-brand">
          <div className="signup-logo">AS</div>
        </div>
        
        <div className="signup-header">
          <h1>회원가입</h1>
          <p>AsyncSite의 새로운 멤버가 되어주세요</p>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">
            {errors.general}
          </div>
        )}

        {/* Signup Method Selection */}
        {signupMethod === null ? (
          <div className="signup-method-selection">
            {/* Google Sign up Button */}
            <button
              onClick={() => window.location.href = `${env.apiBaseUrl}/api/auth/oauth/google/login`}
              className="google-signup-button auth-button"
              type="button"
              aria-label="Google 계정으로 회원가입"
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

            <div className="signup-divider">
              <span>또는</span>
            </div>

            {/* Email Signup Button */}
            <button
              onClick={() => setSignupMethod('email')}
              className="email-signup-button auth-button auth-button-secondary"
              type="button"
              aria-label="이메일로 회원가입"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>이메일로 가입하기</span>
            </button>

            {/* Passkey Signup Button */}
            <div className="signup-divider">
              <span>또는</span>
            </div>
            <button
              onClick={() => {
                setSignupMethod('passkey');
                setCurrentStep('email');
                setCompletedSteps([]);
                setEmailAvailable(null);
                setEmailCheckTriggered(false);
              }}
              className="auth-button auth-button-secondary"
              type="button"
              aria-label="패스키로 계속하기(비밀번호 없이)"
              disabled={!webauthnSupported}
            >
              🔐 패스키로 계속하기 (비밀번호 없이)
            </button>
            {!webauthnSupported && (
              <div className="info-message auth-info-message" style={{ marginTop: '8px' }}>
                현재 브라우저에서 패스키를 사용할 수 없습니다.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Back to method selection */}
            <button
              type="button"
              onClick={() => {
                setSignupMethod(null);
                setCurrentStep('email');
                setCompletedSteps([]);
                setEmailAvailable(null);
                setEmailCheckTriggered(false);
              }}
              className="back-to-methods-button"
              aria-label="가입 방법 선택으로 돌아가기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>다른 방법으로 가입</span>
            </button>

            <form onSubmit={handleSubmit} className="signup-form">
          {/* Email Step */}
          <div className={`form-step-wrapper auth-fade-in ${completedSteps.includes('email') ? 'completed' : ''}`}>
            <div className="form-group auth-form-group">
              <label htmlFor="email" className="auth-label">
                이메일 주소를 입력해주세요
              </label>
              <div className="input-with-button">
                <input
                  ref={emailRef}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && checkEmailAvailability()}
                  className={`auth-input ${errors.email ? 'error' : ''} ${emailAvailable === true ? 'success' : ''}`}
                  placeholder="example@email.com"
                  autoComplete="email"
                  disabled={isCheckingEmail}
                />
                <button
                  type="button"
                  onClick={checkEmailAvailability}
                  className="check-button"
                  disabled={isCheckingEmail || !formData.email}
                >
                  {isCheckingEmail ? '확인 중...' : emailAvailable !== null && completedSteps.includes('email') ? '다시 확인' : '중복 확인'}
                </button>
              </div>
              {errors.email && (
                <span className="error-message auth-error-message">
                  {errors.email}
                </span>
              )}
              {!errors.email && emailAvailable === true && (
                <span className="success-message auth-success-message">
                  사용 가능한 이메일입니다
                </span>
              )}
              {isCheckingEmail && (
                <span className="info-message auth-info-message">
                  이메일 중복을 확인하고 있습니다...
                </span>
              )}
              {/* Realtime email validation feedback removed to prevent duplicate messages */}
            </div>
          </div>

          {/* Name Step */}
          <div className={`form-step-wrapper ${completedSteps.includes('email') || completedSteps.includes('name') ? 'auth-fade-in' : 'hidden'} ${completedSteps.includes('name') ? 'completed' : ''}`}>
            <div className="form-group auth-form-group">
              <label htmlFor="name" className="auth-label">
                이름을 입력해주세요
              </label>
              <input
                ref={nameRef}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyPress={(e) => e.key === 'Enter' && handleStepComplete('name')}
                className={`auth-input ${errors.name ? 'error' : ''}`}
                placeholder="홍길동"
                autoComplete="name"
              />
              {errors.name && (
                <span className="error-message auth-error-message">
                  {errors.name}
                </span>
              )}
              {currentStep === 'name' && !completedSteps.includes('name') && (
                <button
                  type="button"
                  onClick={() => handleStepComplete('name')}
                  className="next-button auth-button auth-button-primary"
                  disabled={!formData.name}
                >
                  다음
                </button>
              )}
            </div>
          </div>

          {/* Password Step (email method only) */}
          {signupMethod === 'email' && (
          <div className={`form-step-wrapper ${completedSteps.includes('name') || completedSteps.includes('password') ? 'auth-fade-in' : 'hidden'} ${completedSteps.includes('password') ? 'completed' : ''}`}>
            <div className="form-group auth-form-group">
              <label htmlFor="password" className="auth-label">
                비밀번호를 설정해주세요
              </label>
              <div className="input-wrapper password-input-wrapper">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setPasswordTouched(true)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStepComplete('password')}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="8자 이상 입력"
                  autoComplete="new-password"
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
              {/* Show a single-line password error only after blur or next-step attempt */}
              {errors.password && (passwordTouched || passwordNextAttempted) && (
                <span className="error-message auth-error-message">
                  {errors.password}
                </span>
              )}
              {currentStep === 'password' && !completedSteps.includes('password') && 
               !(formData.password && formData.password.length >= 8) && (
                <button
                  type="button"
                  onClick={() => { setPasswordNextAttempted(true); handleStepComplete('password'); }}
                  className="next-button auth-button auth-button-primary"
                  disabled={!formData.password}
                >
                  다음
                </button>
              )}
            </div>
          </div>
          )}

          {/* Confirm Password Step (email method only) */}
          {signupMethod === 'email' && (
          <div className={`form-step-wrapper ${(completedSteps.includes('password') || (currentStep === 'password' && formData.password && formData.password.length >= 8)) || completedSteps.includes('confirmPassword') ? 'auth-fade-in' : 'hidden'} ${completedSteps.includes('confirmPassword') ? 'completed' : ''}`}>
            <div className="form-group auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                비밀번호를 한 번 더 입력해주세요
              </label>
              <div className="input-wrapper password-input-wrapper">
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className={`auth-input ${errors.confirmPassword ? 'error' : ''} ${!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : ''}`}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && (
                <span className="error-message auth-error-message">
                  {errors.confirmPassword}
                </span>
              )}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span className="success-message auth-success-message">
                  비밀번호가 일치합니다
                </span>
              )}
              {(formData.email && formData.name && formData.password) && (
                <button
                  type="submit"
                  className={`signup-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                >
                  {isSubmitting ? '' : '회원가입 완료'}
                </button>
              )}
            </div>
          </div>
          )}

          {/* Passkey submit (passkey method only) */}
          {signupMethod === 'passkey' && (
            <div className={`form-step-wrapper ${(completedSteps.includes('name')) ? 'auth-fade-in' : 'hidden'}`}>
              <div className="form-group auth-form-group">
                <button
                  type="button"
                  onClick={handlePasskeySignup}
                  className={`signup-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !webauthnSupported}
                >
                  {isSubmitting ? '' : '🔐 패스키로 가입하기'}
                </button>
              </div>
            </div>
          )}
        </form>
          </>
        )}

        <div className="signup-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="login-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
      
      {/* 패스키 등록 모달 */}
      {showPasskeyPrompt && isAuthenticated && (
        <PasskeyPromptModal
          isOpen={showPasskeyPrompt}
          onClose={() => {
            setShowPasskeyPrompt(false);
            // 패스키 모달 닫힌 후 프로필 온보딩 모달 표시
            setShowProfileOnboarding(true);
          }}
          userEmail={formData.email}
          userName={formData.name}
        />
      )}
      
      {/* 프로필 온보딩 모달 */}
      {showProfileOnboarding && isAuthenticated && !showPasskeyPrompt && (
        <ProfileOnboardingModal
          isOpen={showProfileOnboarding}
          onClose={() => {
            setShowProfileOnboarding(false);
            setShouldRedirect(true);
          }}
          userName={formData.name}
          userEmail={formData.email}
        />
      )}
    </div>
  );
}

export default SignupPage;