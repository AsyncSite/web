/**
 * Enhanced SignupPage with Client-side Validation
 * 
 * 기존 SignupPage.tsx를 보존하고 새로운 검증 시스템을 통합한 버전
 * 백엔드와 동기화된 검증 로직 적용
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import userService from '../../api/userService';
import StarBackground from '../../components/common/StarBackground';
import './SignupPage.css';

// 새로운 검증 시스템 import
import {
  registrationEmailValidator,
  securePasswordValidator,
  profileNameValidator,
  ClientAuthFormValidationResult,
  ClientPasswordStrengthTier,
  RegistrationUserContext,
  RealtimeValidationOptions
} from '../../utils/clientAuthValidation';

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

interface SignupFormWarnings {
  email?: string[];
  password?: string[];
  name?: string[];
}

interface SignupFormMetadata {
  passwordStrength?: ClientPasswordStrengthTier;
  passwordEntropy?: number;
  passwordCrackTime?: string;
  emailRiskScore?: number;
}

type SignupStep = 'email' | 'name' | 'password' | 'confirmPassword';
type SignupMethod = 'google' | 'email' | null;

function SignupPageEnhanced(): React.ReactNode {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [warnings, setWarnings] = useState<SignupFormWarnings>({});
  const [metadata, setMetadata] = useState<SignupFormMetadata>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupMethod, setSignupMethod] = useState<SignupMethod>(null);
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [completedSteps, setCompletedSteps] = useState<SignupStep[]>([]);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckTriggered, setEmailCheckTriggered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 실시간 검증을 위한 상태
  const [realtimeValidation, setRealtimeValidation] = useState<{
    email?: ClientAuthFormValidationResult;
    password?: ClientAuthFormValidationResult;
    name?: ClientAuthFormValidationResult;
  }>({});
  
  // Debounce values for API calls and validation
  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPassword = useDebounce(formData.password, 300);
  const debouncedName = useDebounce(formData.name, 300);
  
  // Refs for input focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // 검증 옵션
  const validationOptions: RealtimeValidationOptions = {
    enableRealtimeFeedback: true,
    debounceDelayMs: 300,
    validationLocale: 'ko',
    registrationEmailOptions: {
      checkDuplicateViaAPI: true,
      blockDisposableEmails: true
    },
    securePasswordOptions: {
      checkPersonalInfoInclusion: true,
      minimumCharacterTypes: 3
    },
    profileNameOptions: {
      preventXSSPatterns: true,
      preventSQLInjection: true,
      allowEmojis: false
    }
  };

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

  // Enhanced email validation with new system
  useEffect(() => {
    if (!debouncedEmail || currentStep !== 'email') return;

    const validation = registrationEmailValidator.validateRegistrationEmail(
      debouncedEmail,
      validationOptions
    );
    
    setRealtimeValidation(prev => ({ ...prev, email: validation }));
    
    // Update errors
    if (validation.fieldErrors.length > 0) {
      const criticalError = validation.fieldErrors.find(e => e.errorSeverity === 'critical');
      const majorError = validation.fieldErrors.find(e => e.errorSeverity === 'major');
      setErrors(prev => ({ 
        ...prev, 
        email: criticalError?.errorMessage || majorError?.errorMessage || validation.fieldErrors[0].errorMessage 
      }));
      setEmailAvailable(null);
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
      // Check email availability via API
      checkEmailAvailabilityAPI(debouncedEmail);
    }
    
    // Update warnings
    if (validation.fieldWarnings && validation.fieldWarnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        email: validation.fieldWarnings!.map(w => w.warningMessage)
      }));
    } else {
      setWarnings(prev => ({ ...prev, email: undefined }));
    }
    
    // Update metadata
    if (validation.enhancedMetadata?.registrationEmailMetrics) {
      setMetadata(prev => ({
        ...prev,
        emailRiskScore: validation.enhancedMetadata!.registrationEmailMetrics!.emailRiskScore
      }));
    }
  }, [debouncedEmail, currentStep]);

  // Enhanced password validation
  useEffect(() => {
    if (!debouncedPassword || currentStep !== 'password') return;

    const context: RegistrationUserContext = {
      registrationEmailValue: formData.email,
      profileNameValue: formData.name
    };
    
    const validation = securePasswordValidator.validateSecurePassword(
      debouncedPassword,
      context,
      validationOptions
    );
    
    setRealtimeValidation(prev => ({ ...prev, password: validation }));
    
    // Update errors
    if (validation.fieldErrors.length > 0) {
      const criticalError = validation.fieldErrors.find(e => e.errorSeverity === 'critical');
      const majorError = validation.fieldErrors.find(e => e.errorSeverity === 'major');
      setErrors(prev => ({ 
        ...prev, 
        password: criticalError?.errorMessage || majorError?.errorMessage || validation.fieldErrors[0].errorMessage 
      }));
    } else {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    
    // Update warnings
    if (validation.fieldWarnings && validation.fieldWarnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        password: validation.fieldWarnings!.map(w => w.warningMessage)
      }));
    } else {
      setWarnings(prev => ({ ...prev, password: undefined }));
    }
    
    // Update password strength metadata
    if (validation.enhancedMetadata?.securePasswordMetrics) {
      const metrics = validation.enhancedMetadata.securePasswordMetrics;
      setMetadata(prev => ({
        ...prev,
        passwordStrength: metrics.strengthLevel,
        passwordEntropy: metrics.entropyScore,
        passwordCrackTime: metrics.estimatedCrackTime
      }));
    }
  }, [debouncedPassword, currentStep, formData.email, formData.name]);

  // Enhanced name validation
  useEffect(() => {
    if (!debouncedName || currentStep !== 'name') return;

    const validation = profileNameValidator.validateProfileName(
      debouncedName,
      validationOptions
    );
    
    setRealtimeValidation(prev => ({ ...prev, name: validation }));
    
    // Update errors
    if (validation.fieldErrors.length > 0) {
      const criticalError = validation.fieldErrors.find(e => e.errorSeverity === 'critical');
      const majorError = validation.fieldErrors.find(e => e.errorSeverity === 'major');
      setErrors(prev => ({ 
        ...prev, 
        name: criticalError?.errorMessage || majorError?.errorMessage || validation.fieldErrors[0].errorMessage 
      }));
    } else {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    
    // Update warnings
    if (validation.fieldWarnings && validation.fieldWarnings.length > 0) {
      setWarnings(prev => ({
        ...prev,
        name: validation.fieldWarnings!.map(w => w.warningMessage)
      }));
    } else {
      setWarnings(prev => ({ ...prev, name: undefined }));
    }
  }, [debouncedName, currentStep]);

  // Check email availability via API
  const checkEmailAvailabilityAPI = async (email: string) => {
    setIsCheckingEmail(true);
    try {
      const isAvailable = await userService.checkEmailAvailability(email);
      setEmailAvailable(isAvailable);
      
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
      }
    } catch (error) {
      console.error('Email check failed:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Auto-proceed to next step when email is available
  useEffect(() => {
    if (emailAvailable === true && currentStep === 'email' && !completedSteps.includes('email')) {
      const emailValidation = realtimeValidation.email;
      if (emailValidation?.isValid) {
        setCompletedSteps([...completedSteps, 'email']);
        setCurrentStep('name');
      }
    }
  }, [emailAvailable, currentStep, completedSteps, realtimeValidation.email]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/users/me" replace />;
  }

  // Enhanced step validation
  const validateStepEnhanced = (step: SignupStep): boolean => {
    switch (step) {
      case 'email':
        const emailValidation = registrationEmailValidator.validateRegistrationEmail(
          formData.email,
          validationOptions
        );
        if (!emailValidation.isValid) {
          setErrors({ email: emailValidation.fieldErrors[0]?.errorMessage });
          return false;
        }
        return emailAvailable === true;
        
      case 'name':
        const nameValidation = profileNameValidator.validateProfileName(
          formData.name,
          validationOptions
        );
        if (!nameValidation.isValid) {
          setErrors({ name: nameValidation.fieldErrors[0]?.errorMessage });
          return false;
        }
        return true;
        
      case 'password':
        const context: RegistrationUserContext = {
          registrationEmailValue: formData.email,
          profileNameValue: formData.name
        };
        const passwordValidation = securePasswordValidator.validateSecurePassword(
          formData.password,
          context,
          validationOptions
        );
        if (!passwordValidation.isValid) {
          setErrors({ password: passwordValidation.fieldErrors[0]?.errorMessage });
          return false;
        }
        return true;
        
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다' });
          return false;
        }
        return true;
        
      default:
        return false;
    }
  };

  const handleStepComplete = (step: SignupStep) => {
    if (validateStepEnhanced(step)) {
      if (!completedSteps.includes(step)) {
        setCompletedSteps([...completedSteps, step]);
      }
      
      // Move to next step
      const steps: SignupStep[] = ['email', 'name', 'password', 'confirmPassword'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Reset email availability status when email changes
    if (name === 'email') {
      setEmailAvailable(null);
      setEmailCheckTriggered(true);
      if (completedSteps.includes('email')) {
        setCompletedSteps(prev => prev.filter(step => step !== 'email'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    const emailVal = registrationEmailValidator.validateRegistrationEmail(formData.email, validationOptions);
    const context: RegistrationUserContext = {
      registrationEmailValue: formData.email,
      profileNameValue: formData.name
    };
    const passwordVal = securePasswordValidator.validateSecurePassword(formData.password, context, validationOptions);
    const nameVal = profileNameValidator.validateProfileName(formData.name, validationOptions);
    
    if (!emailVal.isValid || !passwordVal.isValid || !nameVal.isValid) {
      setErrors({
        email: emailVal.fieldErrors[0]?.errorMessage,
        password: passwordVal.fieldErrors[0]?.errorMessage,
        name: nameVal.fieldErrors[0]?.errorMessage
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      if (message.includes('이메일')) {
        setErrors({ email: message });
      } else {
        setErrors({ general: message });
      }
      setIsSubmitting(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!metadata.passwordStrength || currentStep !== 'password') return null;
    
    const strengthColors = {
      [ClientPasswordStrengthTier.CRITICALLY_WEAK]: '#ff4444',
      [ClientPasswordStrengthTier.VERY_WEAK]: '#ff6666',
      [ClientPasswordStrengthTier.WEAK]: '#ff9999',
      [ClientPasswordStrengthTier.MODERATE]: '#ffcc00',
      [ClientPasswordStrengthTier.STRONG]: '#66cc66',
      [ClientPasswordStrengthTier.VERY_STRONG]: '#44aa44',
      [ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG]: '#228822'
    };
    
    const strengthLabels = {
      [ClientPasswordStrengthTier.CRITICALLY_WEAK]: '매우 약함',
      [ClientPasswordStrengthTier.VERY_WEAK]: '약함',
      [ClientPasswordStrengthTier.WEAK]: '보통',
      [ClientPasswordStrengthTier.MODERATE]: '적절함',
      [ClientPasswordStrengthTier.STRONG]: '강함',
      [ClientPasswordStrengthTier.VERY_STRONG]: '매우 강함',
      [ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG]: '탁월함'
    };
    
    const strengthPercentage = {
      [ClientPasswordStrengthTier.CRITICALLY_WEAK]: 14,
      [ClientPasswordStrengthTier.VERY_WEAK]: 28,
      [ClientPasswordStrengthTier.WEAK]: 42,
      [ClientPasswordStrengthTier.MODERATE]: 56,
      [ClientPasswordStrengthTier.STRONG]: 70,
      [ClientPasswordStrengthTier.VERY_STRONG]: 85,
      [ClientPasswordStrengthTier.EXCEPTIONALLY_STRONG]: 100
    };
    
    return (
      <div className="password-strength-indicator" style={{ marginTop: '8px' }}>
        <div className="strength-bar" style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div 
            className="strength-fill" 
            style={{ 
              width: `${strengthPercentage[metadata.passwordStrength]}%`,
              height: '100%',
              backgroundColor: strengthColors[metadata.passwordStrength],
              transition: 'all 0.3s ease'
            }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '4px',
          fontSize: '12px'
        }}>
          <span style={{ color: strengthColors[metadata.passwordStrength] }}>
            {strengthLabels[metadata.passwordStrength]}
          </span>
          {metadata.passwordCrackTime && (
            <span style={{ color: '#666' }}>
              예상 해독 시간: {metadata.passwordCrackTime}
            </span>
          )}
        </div>
        {metadata.passwordEntropy && (
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            엔트로피: {metadata.passwordEntropy.toFixed(1)}
          </div>
        )}
      </div>
    );
  };

  // Warning display component
  const WarningDisplay = ({ warnings: fieldWarnings }: { warnings?: string[] }) => {
    if (!fieldWarnings || fieldWarnings.length === 0) return null;
    
    return (
      <div className="field-warnings" style={{ marginTop: '4px' }}>
        {fieldWarnings.map((warning, index) => (
          <div 
            key={index}
            style={{ 
              fontSize: '12px', 
              color: '#ff9800',
              marginTop: '2px'
            }}
          >
            ⚠️ {warning}
          </div>
        ))}
      </div>
    );
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
            {/* Email Sign up Button */}
            <button 
              className="signup-method-button email-method"
              onClick={() => setSignupMethod('email')}
            >
              <svg className="method-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="method-text">이메일로 시작하기</span>
            </button>
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="signup-progress">
              <div className={`progress-step ${completedSteps.includes('email') ? 'completed' : currentStep === 'email' ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">이메일</span>
              </div>
              <div className={`progress-step ${completedSteps.includes('name') ? 'completed' : currentStep === 'name' ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">이름</span>
              </div>
              <div className={`progress-step ${completedSteps.includes('password') ? 'completed' : currentStep === 'password' ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">비밀번호</span>
              </div>
              <div className={`progress-step ${completedSteps.includes('confirmPassword') ? 'completed' : currentStep === 'confirmPassword' ? 'active' : ''}`}>
                <span className="step-number">4</span>
                <span className="step-label">확인</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Email Step */}
              <div className={`form-step ${currentStep === 'email' ? 'active' : ''}`}>
                <div className="form-group auth-form-group">
                  <label htmlFor="email" className="auth-label">
                    이메일 주소
                  </label>
                  <div className="input-with-status">
                    <input
                      ref={emailRef}
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                      className={`auth-input ${errors.email ? 'error' : emailAvailable === true ? 'success' : ''}`}
                      placeholder="example@email.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                    {isCheckingEmail && (
                      <span className="input-status checking">확인 중...</span>
                    )}
                    {emailAvailable === true && !isCheckingEmail && (
                      <span className="input-status success">✓</span>
                    )}
                  </div>
                  {errors.email && (
                    <span className="error-message auth-error-message">
                      {errors.email}
                    </span>
                  )}
                  <WarningDisplay warnings={warnings.email} />
                  {metadata.emailRiskScore && metadata.emailRiskScore > 50 && (
                    <div style={{ fontSize: '11px', color: '#ff9800', marginTop: '4px' }}>
                      위험도: {metadata.emailRiskScore}% - 더 안전한 이메일을 사용하는 것을 권장합니다
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStepComplete('email')}
                    className="step-continue-button auth-button primary"
                    disabled={!formData.email || isCheckingEmail || !!errors.email}
                  >
                    계속하기
                  </button>
                </div>
              </div>

              {/* Name Step */}
              <div className={`form-step ${currentStep === 'name' ? 'active' : ''}`}>
                <div className="form-group auth-form-group">
                  <label htmlFor="name" className="auth-label">
                    이름
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
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <span className="error-message auth-error-message">
                      {errors.name}
                    </span>
                  )}
                  <WarningDisplay warnings={warnings.name} />
                  <button
                    type="button"
                    onClick={() => handleStepComplete('name')}
                    className="step-continue-button auth-button primary"
                    disabled={!formData.name || !!errors.name}
                  >
                    계속하기
                  </button>
                </div>
              </div>

              {/* Password Step */}
              <div className={`form-step ${currentStep === 'password' ? 'active' : ''}`}>
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
                      onKeyPress={(e) => e.key === 'Enter' && handleStepComplete('password')}
                      className={`auth-input ${errors.password ? 'error' : ''}`}
                      placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? '숨기기' : '보기'}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message auth-error-message">
                      {errors.password}
                    </span>
                  )}
                  <WarningDisplay warnings={warnings.password} />
                  <PasswordStrengthIndicator />
                  <button
                    type="button"
                    onClick={() => handleStepComplete('password')}
                    className="step-continue-button auth-button primary"
                    disabled={!formData.password || !!errors.password}
                  >
                    계속하기
                  </button>
                </div>
              </div>

              {/* Confirm Password Step */}
              <div className={`form-step ${currentStep === 'confirmPassword' ? 'active' : ''}`}>
                <div className="form-group auth-form-group">
                  <label htmlFor="confirmPassword" className="auth-label">
                    비밀번호 확인
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                      className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="비밀번호를 다시 입력해주세요"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? '숨기기' : '보기'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message auth-error-message">
                      {errors.confirmPassword}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="auth-button primary full-width"
                    disabled={isSubmitting || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                  >
                    {isSubmitting ? '가입 중...' : '회원가입 완료'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPageEnhanced;