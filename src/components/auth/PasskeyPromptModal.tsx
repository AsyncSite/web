import React, { useState, useEffect } from 'react';
import { createPasskey } from '../../utils/webauthn/helpers';
import apiClient from '../../api/client';
import './PasskeyPromptModal.css';

interface PasskeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

const DISMISS_KEY = 'passkey_prompt_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

function PasskeyPromptModal({ isOpen, onClose, userEmail, userName }: PasskeyPromptModalProps): React.ReactNode {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  // 이미 "나중에" 선택했는지 확인
  useEffect(() => {
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime) {
      const dismissedAt = parseInt(dismissedTime);
      const now = Date.now();
      if (now - dismissedAt < DISMISS_DURATION) {
        onClose(); // 7일 이내면 모달 표시 안함
      }
    }
  }, [onClose]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setError('');
    
    try {
      // 1. 패스키 등록 옵션 요청
      const optionsRes = await apiClient.post('/api/webauthn/register/options', {
        userId: userEmail,
        username: userEmail,
        displayName: userName || userEmail
      });
      const options = optionsRes.data.data;
      
      // 2. 브라우저에서 패스키 생성
      const credential = await createPasskey(options);
      
      // 3. 서버에 검증 요청
      await apiClient.post('/api/webauthn/register/verify', {
        userId: userEmail,
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          attestationObject: credential.response.attestationObject
        }
      });
      
      setRegistrationSuccess(true);
      
      // 2초 후 자동으로 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Passkey registration failed:', err);
      
      if (err?.name === 'NotAllowedError') {
        setError('패스키 등록이 취소되었습니다.');
      } else if (err?.name === 'InvalidStateError') {
        setError('이미 등록된 패스키가 있습니다.');
      } else {
        setError('패스키 등록에 실패했습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="passkey-modal-overlay" onClick={onClose}>
      <div className="passkey-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="passkey-modal-close" onClick={onClose}>×</button>
        
        {registrationSuccess ? (
          <div className="passkey-modal-success">
            <div className="success-icon">✅</div>
            <h2>패스키 등록 완료!</h2>
            <p>다음 로그인부터 패스키를 사용할 수 있습니다.</p>
          </div>
        ) : (
          <>
            <div className="passkey-modal-header">
              <div className="passkey-icon">🔐</div>
              <h2>더 빠르고 안전한 로그인</h2>
              <p className="subtitle">패스키로 비밀번호 없이 로그인하세요</p>
            </div>
            
            <div className="passkey-modal-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <div>
                  <strong>빠른 로그인</strong>
                  <p>생체인증(지문/얼굴)으로 1초만에</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🛡️</span>
                <div>
                  <strong>완벽한 보안</strong>
                  <p>피싱과 해킹으로부터 안전</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <div>
                  <strong>모든 기기에서</strong>
                  <p>휴대폰, 노트북, 태블릿 모두 지원</p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="passkey-modal-error">
                {error}
              </div>
            )}
            
            <div className="passkey-modal-actions">
              <button 
                className="passkey-register-btn"
                onClick={handleRegister}
                disabled={isRegistering}
              >
                {isRegistering ? '등록 중...' : '패스키 등록하기'}
              </button>
              
              <button 
                className="passkey-later-btn"
                onClick={handleDismiss}
                disabled={isRegistering}
              >
                나중에 하기
              </button>
            </div>
            
            <p className="passkey-modal-note">
              프로필 설정에서 언제든지 패스키를 등록할 수 있습니다
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default PasskeyPromptModal;