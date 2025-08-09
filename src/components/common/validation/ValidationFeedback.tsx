import React, { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { 
  registrationEmailValidator,
  securePasswordValidator,
  profileNameValidator
} from '../../../utils/clientAuthValidation';
import {
  ClientAuthFormValidationResult,
  RegistrationUserContext,
  RealtimeValidationOptions
} from '../../../utils/clientAuthValidation/types';
import './ValidationFeedback.css';

interface AsyncSiteValidationFeedbackProps {
  fieldType: 'email' | 'password' | 'name';
  value: string;
  userContext?: RegistrationUserContext;
  options?: RealtimeValidationOptions;
  onValidationChange?: (result: ClientAuthFormValidationResult) => void;
  debounceMs?: number;
  showWarnings?: boolean;
  showSuccessMessage?: boolean;
}

export function ValidationFeedback({
  fieldType,
  value,
  userContext,
  options,
  onValidationChange,
  debounceMs = 300,
  showWarnings = true,
  showSuccessMessage = true
}: AsyncSiteValidationFeedbackProps): React.ReactNode {
  const [asyncSiteValidation_result, setAsyncSiteValidation_result] = 
    useState<ClientAuthFormValidationResult | null>(null);
  const [asyncSiteValidation_isValidating, setAsyncSiteValidation_isValidating] = 
    useState(false);
  
  const asyncSiteValidation_debouncedValue = useDebounce(value, debounceMs);
  
  const asyncSiteValidation_validate = useCallback(() => {
    if (!asyncSiteValidation_debouncedValue) {
      setAsyncSiteValidation_result(null);
      return;
    }
    
    setAsyncSiteValidation_isValidating(true);
    
    let validationSync_result: ClientAuthFormValidationResult;
    
    switch (fieldType) {
      case 'email':
        validationSync_result = registrationEmailValidator.validateRegistrationEmail(
          asyncSiteValidation_debouncedValue,
          options
        );
        break;
      case 'password':
        validationSync_result = securePasswordValidator.validateSecurePassword(
          asyncSiteValidation_debouncedValue,
          userContext,
          options
        );
        break;
      case 'name':
        validationSync_result = profileNameValidator.validateProfileName(
          asyncSiteValidation_debouncedValue,
          options
        );
        break;
      default:
        validationSync_result = {
          isValid: false,
          fieldErrors: [],
          fieldWarnings: []
        };
    }
    
    setAsyncSiteValidation_result(validationSync_result);
    setAsyncSiteValidation_isValidating(false);
    
    if (onValidationChange) {
      onValidationChange(validationSync_result);
    }
  }, [asyncSiteValidation_debouncedValue, fieldType, userContext, options, onValidationChange]);
  
  useEffect(() => {
    asyncSiteValidation_validate();
  }, [asyncSiteValidation_validate]);
  
  if (!asyncSiteValidation_result && !asyncSiteValidation_isValidating) {
    return null;
  }
  
  const asyncSiteValidation_hasErrors = 
    asyncSiteValidation_result?.fieldErrors && 
    asyncSiteValidation_result.fieldErrors.length > 0;
  
  const asyncSiteValidation_hasWarnings = 
    asyncSiteValidation_result?.fieldWarnings && 
    asyncSiteValidation_result.fieldWarnings.length > 0;
  
  const asyncSiteValidation_isValid = 
    asyncSiteValidation_result?.isValid && 
    !asyncSiteValidation_hasErrors;
  
  return (
    <div className="asyncsite-validation-feedback">
      {asyncSiteValidation_isValidating && (
        <div className="asyncsite-validation-loading">
          <span className="asyncsite-validation-spinner"></span>
          <span className="asyncsite-validation-text">검증 중...</span>
        </div>
      )}
      
      {!asyncSiteValidation_isValidating && asyncSiteValidation_hasErrors && (
        <div className="asyncsite-validation-errors">
          {asyncSiteValidation_result?.fieldErrors?.map((error, index) => (
            <div 
              key={`error-${index}`} 
              className={`asyncsite-validation-error asyncsite-validation-error-${error.errorSeverity}`}
            >
              <span className="asyncsite-validation-icon">⚠️</span>
              <span className="asyncsite-validation-message">{error.errorMessage}</span>
            </div>
          ))}
        </div>
      )}
      
      {!asyncSiteValidation_isValidating && showWarnings && asyncSiteValidation_hasWarnings && (
        <div className="asyncsite-validation-warnings">
          {asyncSiteValidation_result?.fieldWarnings?.map((warning, index) => (
            <div 
              key={`warning-${index}`} 
              className={`asyncsite-validation-warning asyncsite-validation-warning-${warning.securityRiskLevel}`}
            >
              <span className="asyncsite-validation-icon">ℹ️</span>
              <span className="asyncsite-validation-message">{warning.warningMessage}</span>
              {warning.improvementSuggestion && (
                <span className="asyncsite-validation-suggestion">
                  {warning.improvementSuggestion}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!asyncSiteValidation_isValidating && 
       showSuccessMessage && 
       asyncSiteValidation_isValid && 
       !asyncSiteValidation_hasWarnings && (
        <div className="asyncsite-validation-success">
          <span className="asyncsite-validation-icon">✅</span>
          <span className="asyncsite-validation-message">
            {fieldType === 'email' && '사용 가능한 이메일입니다'}
            {fieldType === 'password' && '안전한 비밀번호입니다'}
            {fieldType === 'name' && '적절한 이름입니다'}
          </span>
        </div>
      )}
      
      {fieldType === 'password' && 
       asyncSiteValidation_result?.enhancedMetadata?.securePasswordMetrics && (
        <div className="asyncsite-validation-password-metrics">
          {asyncSiteValidation_result.enhancedMetadata.securePasswordMetrics.improvementTips?.map(
            (tip, index) => (
              <div key={`tip-${index}`} className="asyncsite-validation-tip">
                <span className="asyncsite-validation-icon">💡</span>
                <span className="asyncsite-validation-text">{tip}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}