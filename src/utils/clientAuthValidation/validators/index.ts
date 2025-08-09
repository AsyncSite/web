/**
 * Client Authentication Validators
 * 
 * 모든 검증기를 중앙에서 관리
 */

// 이메일 검증기
export { 
  RegistrationEmailClientValidator,
  registrationEmailValidator 
} from './RegistrationEmailClientValidator';

// 비밀번호 검증기
export { 
  SecurePasswordInputValidator,
  securePasswordValidator 
} from './SecurePasswordInputValidator';

// 이름 검증기
export { 
  ProfileNameInputValidator,
  profileNameValidator 
} from './ProfileNameInputValidator';

// 통합 검증 헬퍼 함수들
import { 
  ClientAuthFormValidationResult,
  RegistrationUserContext,
  RealtimeValidationOptions 
} from '../types';
import { registrationEmailValidator } from './RegistrationEmailClientValidator';
import { securePasswordValidator } from './SecurePasswordInputValidator';
import { profileNameValidator } from './ProfileNameInputValidator';

/**
 * 회원가입 폼 전체 검증
 */
export function validateRegistrationForm(
  email: string,
  password: string,
  confirmPassword: string,
  name: string,
  options?: RealtimeValidationOptions
): {
  email: ClientAuthFormValidationResult;
  password: ClientAuthFormValidationResult;
  confirmPassword: ClientAuthFormValidationResult;
  name: ClientAuthFormValidationResult;
  isFormValid: boolean;
} {
  // 이메일 검증
  const emailResult = registrationEmailValidator.validateRegistrationEmail(email, options);
  
  // 비밀번호 검증 (개인정보 포함 체크를 위한 context 전달)
  const context: RegistrationUserContext = {
    registrationEmailValue: email,
    profileNameValue: name
  };
  const passwordResult = securePasswordValidator.validateSecurePassword(password, context, options);
  
  // 비밀번호 확인 검증
  let confirmPasswordResult: ClientAuthFormValidationResult;
  if (!confirmPassword) {
    confirmPasswordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'CONFIRM_PASSWORD_REQUIRED',
        errorMessage: '비밀번호 확인을 입력해주세요',
        fieldName: 'signupPassword',
        errorSeverity: 'major'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else if (password !== confirmPassword) {
    confirmPasswordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'PASSWORD_MISMATCH',
        errorMessage: '비밀번호가 일치하지 않습니다',
        fieldName: 'signupPassword',
        errorSeverity: 'major'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else {
    confirmPasswordResult = {
      isValid: true,
      fieldErrors: [],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  }
  
  // 이름 검증
  const nameResult = profileNameValidator.validateProfileName(name, options);
  
  // 전체 폼 유효성
  const isFormValid = 
    emailResult.isValid && 
    passwordResult.isValid && 
    confirmPasswordResult.isValid && 
    nameResult.isValid;
  
  return {
    email: emailResult,
    password: passwordResult,
    confirmPassword: confirmPasswordResult,
    name: nameResult,
    isFormValid
  };
}

/**
 * 로그인 폼 검증
 */
export function validateLoginForm(
  username: string,
  password: string
): {
  username: ClientAuthFormValidationResult;
  password: ClientAuthFormValidationResult;
  isFormValid: boolean;
} {
  // 사용자명(이메일) 검증
  let usernameResult: ClientAuthFormValidationResult;
  if (!username) {
    usernameResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'USERNAME_REQUIRED',
        errorMessage: '이메일 또는 사용자명을 입력해주세요',
        fieldName: 'loginEmail',
        errorSeverity: 'critical'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else {
    // 이메일 형식인 경우 검증
    if (username.includes('@')) {
      usernameResult = registrationEmailValidator.validateRegistrationEmail(username, {
        registrationEmailOptions: {
          blockDisposableEmails: false,  // 로그인 시에는 일회용 이메일 허용
          skipDNSVerification: true       // DNS 검증 스킵
        }
      });
    } else {
      usernameResult = {
        isValid: true,
        fieldErrors: [],
        performanceMetrics: {
          validationTimeMs: 0,
          asyncChecksCompleted: false
        }
      };
    }
  }
  
  // 비밀번호 검증 (기본 검증만)
  let passwordResult: ClientAuthFormValidationResult;
  if (!password) {
    passwordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'PASSWORD_REQUIRED',
        errorMessage: '비밀번호를 입력해주세요',
        fieldName: 'signupPassword',
        errorSeverity: 'critical'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else {
    passwordResult = {
      isValid: true,
      fieldErrors: [],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  }
  
  const isFormValid = usernameResult.isValid && passwordResult.isValid;
  
  return {
    username: usernameResult,
    password: passwordResult,
    isFormValid
  };
}

/**
 * 비밀번호 변경 검증
 */
export function validatePasswordChangeForm(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  userEmail?: string,
  userName?: string
): {
  currentPassword: ClientAuthFormValidationResult;
  newPassword: ClientAuthFormValidationResult;
  confirmPassword: ClientAuthFormValidationResult;
  isFormValid: boolean;
} {
  // 현재 비밀번호 검증
  let currentPasswordResult: ClientAuthFormValidationResult;
  if (!currentPassword) {
    currentPasswordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'CURRENT_PASSWORD_REQUIRED',
        errorMessage: '현재 비밀번호를 입력해주세요',
        fieldName: 'changePassword',
        errorSeverity: 'critical'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else {
    currentPasswordResult = {
      isValid: true,
      fieldErrors: [],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  }
  
  // 새 비밀번호 검증
  const context: RegistrationUserContext = {
    registrationEmailValue: userEmail,
    profileNameValue: userName,
    existingPasswordHash: currentPassword  // 동일 비밀번호 사용 방지
  };
  const newPasswordResult = securePasswordValidator.validateSecurePassword(newPassword, context);
  
  // 새 비밀번호가 현재 비밀번호와 같은지 확인
  if (newPassword === currentPassword) {
    newPasswordResult.fieldErrors.push({
      errorCode: 'SAME_AS_CURRENT_PASSWORD',
      errorMessage: '새 비밀번호는 현재 비밀번호와 달라야 합니다',
      fieldName: 'changePassword',
      errorSeverity: 'major'
    });
    newPasswordResult.isValid = false;
  }
  
  // 비밀번호 확인 검증
  let confirmPasswordResult: ClientAuthFormValidationResult;
  if (!confirmPassword) {
    confirmPasswordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'CONFIRM_PASSWORD_REQUIRED',
        errorMessage: '새 비밀번호 확인을 입력해주세요',
        fieldName: 'changePassword',
        errorSeverity: 'major'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else if (newPassword !== confirmPassword) {
    confirmPasswordResult = {
      isValid: false,
      fieldErrors: [{
        errorCode: 'PASSWORD_MISMATCH',
        errorMessage: '새 비밀번호가 일치하지 않습니다',
        fieldName: 'changePassword',
        errorSeverity: 'major'
      }],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  } else {
    confirmPasswordResult = {
      isValid: true,
      fieldErrors: [],
      performanceMetrics: {
        validationTimeMs: 0,
        asyncChecksCompleted: false
      }
    };
  }
  
  const isFormValid = 
    currentPasswordResult.isValid && 
    newPasswordResult.isValid && 
    confirmPasswordResult.isValid;
  
  return {
    currentPassword: currentPasswordResult,
    newPassword: newPasswordResult,
    confirmPassword: confirmPasswordResult,
    isFormValid
  };
}