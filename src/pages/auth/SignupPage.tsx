import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import userService from '../../api/userService';
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

function SignupPage(): React.ReactNode {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [completedSteps, setCompletedSteps] = useState<SignupStep[]>([]);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckTriggered, setEmailCheckTriggered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Debounce email value for API calls
  const debouncedEmail = useDebounce(formData.email, 500);
  
  // Refs for input focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/users/me" replace />;
  }

  // Focus management
  useEffect(() => {
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
  }, [currentStep]);

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
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!formData.email.trim()) {
          newErrors.email = '이메일을 입력해주세요';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = '올바른 이메일 형식이 아닙니다';
        }
        break;
        
      case 'name':
        if (!formData.name.trim()) {
          newErrors.name = '이름을 입력해주세요';
        } else if (formData.name.length < 2 || formData.name.length > 50) {
          newErrors.name = '이름은 2자 이상 50자 이하여야 합니다';
        }
        break;
        
      case 'password':
        if (!formData.password) {
          newErrors.password = '비밀번호를 입력해주세요';
        } else if (formData.password.length < 8) {
          newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
          newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다';
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
      
      // Move to next step
      const steps: SignupStep[] = ['email', 'name', 'password', 'confirmPassword'];
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
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다';
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
      if (completedSteps.includes('email')) {
        setCompletedSteps(completedSteps.filter(step => step !== 'email'));
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
      // 회원가입 성공 후 명시적으로 navigate
      navigate('/users/me', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다';
      // Check if it's a duplicate email error
      if (message.includes('already exists')) {
        setErrors({ email: '이미 사용 중인 이메일입니다' });
      } else {
        setErrors({ general: message });
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
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="auth-shooting-star"
            style={{
              animationDelay: `${i * 15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
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

          {/* Password Step */}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleStepComplete('password')}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="8자 이상, 영문/숫자/특수문자 포함"
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
              {formData.password && (
                <div className="password-strength">
                  <div className={`strength-bar ${formData.password.length >= 8 ? 'filled' : ''}`} />
                  <div className={`strength-bar ${formData.password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password) ? 'filled' : ''}`} />
                  <div className={`strength-bar ${formData.password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password) ? 'filled' : ''}`} />
                  <span className="strength-text">
                    {formData.password.length < 8 ? '약함' : 
                     /(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password) ? '강함' : '보통'}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error-message auth-error-message">
                  {errors.password}
                </span>
              )}
              {currentStep === 'password' && !completedSteps.includes('password') && (
                <button
                  type="button"
                  onClick={() => handleStepComplete('password')}
                  className="next-button auth-button auth-button-primary"
                  disabled={!formData.password}
                >
                  다음
                </button>
              )}
            </div>
          </div>

          {/* Confirm Password Step - Show immediately when password has value */}
          <div className={`form-step-wrapper ${(formData.password && completedSteps.includes('name')) || completedSteps.includes('password') || completedSteps.includes('confirmPassword') ? 'auth-fade-in' : 'hidden'} ${completedSteps.includes('confirmPassword') ? 'completed' : ''}`}>
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
              {currentStep === 'confirmPassword' && (
                <button
                  type="submit"
                  className={`signup-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || !formData.confirmPassword}
                >
                  {isSubmitting ? '' : '회원가입 완료'}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="signup-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="login-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;