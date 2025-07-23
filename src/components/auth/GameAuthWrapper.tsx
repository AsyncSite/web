import React, { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GameAuthWrapper.css';

interface GameAuthWrapperProps {
  children: ReactNode;
  gameTitle: string;
  requireAuth?: boolean;
  onGuestPlay?: () => void;
  features?: {
    saveProgress?: boolean;
    leaderboard?: boolean;
    achievements?: boolean;
  };
}

const GameAuthWrapper: React.FC<GameAuthWrapperProps> = ({
  children,
  gameTitle,
  requireAuth = false,
  onGuestPlay,
  features = {
    saveProgress: true,
    leaderboard: true,
    achievements: false
  }
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showGuestNotice, setShowGuestNotice] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Hide guest notice after 10 seconds - MUST be before any conditional returns
  React.useEffect(() => {
    if (!isAuthenticated && showGuestNotice) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showGuestNotice]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="game-auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="game-auth-required">
        <div className="auth-required-content">
          <h2>{gameTitle}</h2>
          <div className="auth-icon">🔒</div>
          <h3>로그인이 필요합니다</h3>
          <p>이 게임을 플레이하려면 로그인이 필요합니다.</p>
          <div className="auth-features">
            <h4>로그인하면 가능한 기능:</h4>
            <ul>
              {features.saveProgress && <li>✅ 게임 진행상황 저장</li>}
              {features.leaderboard && <li>🏆 리더보드 참여</li>}
              {features.achievements && <li>🎯 업적 달성</li>}
              <li>📊 게임 통계 추적</li>
            </ul>
          </div>
          <div className="auth-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
            >
              로그인
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated and guest play is allowed
  if (!isAuthenticated && !requireAuth && !showAuthPrompt && !sessionStorage.getItem(`game-auth-prompt-${gameTitle}`)) {
    // Show auth prompt on first load
    return (
        <div className="game-auth-prompt">
          <div className="auth-prompt-content">
            <h2>{gameTitle}</h2>
            <div className="guest-icon">👤</div>
            <h3>게스트로 플레이</h3>
            <p>게스트로 플레이할 수 있지만, 진행상황이 저장되지 않습니다.</p>
            <div className="auth-benefits">
              <h4>로그인 시 혜택:</h4>
              <ul>
                {features.saveProgress && <li>💾 게임 진행상황 저장</li>}
                {features.leaderboard && <li>🏆 리더보드에 점수 등록</li>}
                {features.achievements && <li>🎯 업적 잠금해제</li>}
                <li>📈 시간별 성과 추적</li>
              </ul>
            </div>
            <div className="auth-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
              >
                로그인
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  sessionStorage.setItem(`game-auth-prompt-${gameTitle}`, 'true');
                  setShowAuthPrompt(true);
                  onGuestPlay?.();
                }}
              >
                게스트로 계속
              </button>
            </div>
          </div>
        </div>
      );
  }

  // Render the game with authentication status indicator
  return (
    <div className="game-auth-wrapper">
      {!isAuthenticated && showGuestNotice && (
        <div className={`auth-status-bar ${isMinimized ? 'minimized' : ''}`}>
          {!isMinimized ? (
            <>
              <div className="guest-info">
                <span className="guest-indicator">👤 게스트로 플레이 중</span>
                <span className="guest-message">점수가 로컬에만 저장됩니다</span>
              </div>
              <div className="guest-actions">
                <button 
                  className="login-prompt-btn"
                  onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                >
                  로그인하기
                </button>
                <button 
                  className="minimize-btn"
                  onClick={() => setIsMinimized(true)}
                  aria-label="최소화"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setShowGuestNotice(false)}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
            </>
          ) : (
            <button 
              className="expand-btn"
              onClick={() => setIsMinimized(false)}
              aria-label="게스트 알림 펼치기"
            >
              <span className="guest-indicator-mini">👤</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default GameAuthWrapper;