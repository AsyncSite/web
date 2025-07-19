import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

  // Check email availability
  const checkEmailAvailability = async () => {
    if (!formData.email || !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요' });
      return;
    }

    setIsCheckingEmail(true);
    setErrors({});
    
    try {
      // TODO: 실제 API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시로 랜덤하게 사용 가능/불가능 설정
      const isAvailable = Math.random() > 0.3;
      setEmailAvailable(isAvailable);
      
      if (isAvailable) {
        if (!completedSteps.includes('email')) {
          setCompletedSteps([...completedSteps, 'email']);
          setCurrentStep('name');
        }
      } else {
        setErrors({ email: '이미 사용 중인 이메일입니다' });
      }
    } catch (error) {
      setErrors({ email: '이메일 확인 중 오류가 발생했습니다' });
    } finally {
      setIsCheckingEmail(false);
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
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="auth-shooting-star"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 15 + Math.random() * 10}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
              transform: `rotate(${-30 - Math.random() * 30}deg)`
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
              {emailAvailable === true && completedSteps.includes('email') && (
                <span className="success-message auth-success-message">
                  사용 가능한 이메일입니다
                </span>
              )}
              {emailAvailable !== null && !completedSteps.includes('email') && (
                <span className="warning-message auth-warning-message">
                  이메일이 변경되었습니다. 다시 중복 확인을 해주세요.
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
              <input
                ref={passwordRef}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={(e) => e.key === 'Enter' && handleStepComplete('password')}
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                autoComplete="new-password"
              />
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

          {/* Confirm Password Step */}
          <div className={`form-step-wrapper ${completedSteps.includes('password') || completedSteps.includes('confirmPassword') || currentStep === 'confirmPassword' ? 'auth-fade-in' : 'hidden'} ${completedSteps.includes('confirmPassword') ? 'completed' : ''}`}>
            <div className="form-group auth-form-group">
              <label htmlFor="confirmPassword" className="auth-label">
                비밀번호를 한 번 더 입력해주세요
              </label>
              <input
                ref={confirmPasswordRef}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-message auth-error-message">
                  {errors.confirmPassword}
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