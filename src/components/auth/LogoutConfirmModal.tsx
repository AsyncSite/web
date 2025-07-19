import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LogoutConfirmModal.css';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps): React.ReactNode {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      // 로그아웃은 항상 성공하도록 처리
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="logout-modal">
        <div className="logout-modal-content">
          <div className="logout-icon">
            <div className="logout-icon-circle">
              <span>👋</span>
            </div>
          </div>
          
          <h2>정말 로그아웃 하시겠어요?</h2>
          <p>다음에 또 만나요!</p>

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="stay-button auth-button"
              disabled={isLoggingOut}
            >
              머무르기
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={`logout-button auth-button ${isLoggingOut ? 'loading' : ''}`}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '' : '로그아웃'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogoutConfirmModal;