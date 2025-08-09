import React, { useMemo } from 'react';
import { securePasswordValidator } from '../../../utils/clientAuthValidation';
import { RegistrationUserContext } from '../../../utils/clientAuthValidation/types';
import { 
  BACKEND_SYNC_PASSWORD_STRENGTH,
  SECURE_PASSWORD_CRACK_TIME_ESTIMATES 
} from '../../../utils/clientAuthValidation/constants';
import './PasswordStrengthMeter.css';

interface BackendSyncPasswordStrengthMeterProps {
  password: string;
  userContext?: RegistrationUserContext;
  showDetails?: boolean;
  showCrackTime?: boolean;
  showEntropyScore?: boolean;
  showImprovementTips?: boolean;
}

export function PasswordStrengthMeter({
  password,
  userContext,
  showDetails = true,
  showCrackTime = true,
  showEntropyScore = true,
  showImprovementTips = false
}: BackendSyncPasswordStrengthMeterProps): React.ReactNode {
  const backendSyncStrength_validationResult = useMemo(() => {
    if (!password) return null;
    return securePasswordValidator.validateSecurePassword(password, userContext);
  }, [password, userContext]);
  
  if (!password || !backendSyncStrength_validationResult) {
    return null;
  }
  
  const backendSyncStrength_entropy = 
    backendSyncStrength_validationResult.enhancedMetadata?.securePasswordMetrics?.entropyScore || 0;
  
  const backendSyncStrength_strengthLabel = useMemo(() => {
    const ranges = BACKEND_SYNC_PASSWORD_STRENGTH;
    
    if (backendSyncStrength_entropy >= ranges.VERY_STRONG.min) return 'VERY_STRONG';
    if (backendSyncStrength_entropy >= ranges.STRONG.min) return 'STRONG';
    if (backendSyncStrength_entropy >= ranges.MEDIUM.min) return 'MEDIUM';
    if (backendSyncStrength_entropy >= ranges.WEAK.min) return 'WEAK';
    return 'VERY_WEAK';
  }, [backendSyncStrength_entropy]);
  
  const backendSyncStrength_percentage = useMemo(() => {
    const maxEntropy = 80;
    return Math.min(100, (backendSyncStrength_entropy / maxEntropy) * 100);
  }, [backendSyncStrength_entropy]);
  
  const backendSyncStrength_labelText = useMemo(() => {
    switch (backendSyncStrength_strengthLabel) {
      case 'VERY_STRONG': return '매우 강함';
      case 'STRONG': return '강함';
      case 'MEDIUM': return '보통';
      case 'WEAK': return '약함';
      case 'VERY_WEAK': return '매우 약함';
      default: return '측정 중...';
    }
  }, [backendSyncStrength_strengthLabel]);
  
  const backendSyncStrength_colorClass = useMemo(() => {
    switch (backendSyncStrength_strengthLabel) {
      case 'VERY_STRONG': return 'backendSync-strength-very-strong';
      case 'STRONG': return 'backendSync-strength-strong';
      case 'MEDIUM': return 'backendSync-strength-medium';
      case 'WEAK': return 'backendSync-strength-weak';
      case 'VERY_WEAK': return 'backendSync-strength-very-weak';
      default: return '';
    }
  }, [backendSyncStrength_strengthLabel]);
  
  const backendSyncStrength_crackTime = useMemo(() => {
    const estimates = Object.entries(SECURE_PASSWORD_CRACK_TIME_ESTIMATES);
    for (const [threshold, time] of estimates.reverse()) {
      if (backendSyncStrength_entropy >= Number(threshold)) {
        return time;
      }
    }
    return '즉시';
  }, [backendSyncStrength_entropy]);
  
  const backendSyncStrength_tips = 
    backendSyncStrength_validationResult.enhancedMetadata?.securePasswordMetrics?.improvementTips;
  
  return (
    <div className="backendSync-password-strength-meter">
      <div className="backendSync-strength-header">
        <span className="backendSync-strength-label">비밀번호 보안 수준</span>
        <span className={`backendSync-strength-text ${backendSyncStrength_colorClass}`}>
          {backendSyncStrength_labelText}
        </span>
      </div>
      
      <div className="backendSync-strength-bar-container">
        <div 
          className={`backendSync-strength-bar ${backendSyncStrength_colorClass}`}
          style={{ width: `${backendSyncStrength_percentage}%` }}
        >
          <div className="backendSync-strength-bar-glow"></div>
        </div>
      </div>
      
      {showDetails && (
        <div className="backendSync-strength-details">
          {showEntropyScore && (
            <div className="backendSync-strength-metric">
              <span className="backendSync-metric-label">복잡도 점수:</span>
              <span className={`backendSync-metric-value ${backendSyncStrength_colorClass}`}>
                {Math.min(100, Math.round((backendSyncStrength_entropy / 70) * 100))}%
              </span>
            </div>
          )}
          
          {showCrackTime && (
            <div className="backendSync-strength-metric">
              <span className="backendSync-metric-label">예상 해독 시간:</span>
              <span className={`backendSync-metric-value ${backendSyncStrength_colorClass}`}>
                {backendSyncStrength_crackTime}
              </span>
            </div>
          )}
          
          {backendSyncStrength_validationResult.enhancedMetadata?.securePasswordMetrics?.characterSetDiversity && (
            <div className="backendSync-strength-metric">
              <span className="backendSync-metric-label">문자 종류:</span>
              <span className="backendSync-metric-value">
                {backendSyncStrength_validationResult.enhancedMetadata.securePasswordMetrics.characterSetDiversity}개
              </span>
            </div>
          )}
        </div>
      )}
      
      
      
      {backendSyncStrength_entropy < 35 && (
        <div className="backendSync-strength-warning">
          <span className="backendSync-warning-icon">⚠️</span>
          <span className="backendSync-warning-text">
            더 복잡한 비밀번호가 필요합니다 (현재 보안 수준: {Math.round((backendSyncStrength_entropy / 35) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
}