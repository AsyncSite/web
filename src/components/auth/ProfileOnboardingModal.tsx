import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileOnboardingModal.module.css';

interface ProfileOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
}

// localStorage 키 - 매우 구체적인 네이밍
const PROFILE_ONBOARDING_DISMISS_KEY = 'asyncsite_profile_onboarding_dismissed_v2'; // v2로 업그레이드 (이메일별 구분)
const PROFILE_ONBOARDING_COMPLETED_KEY = 'asyncsite_profile_onboarding_completed_v1';
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000; // 30일

// dismiss 데이터 타입 정의
interface DismissedUser {
  email: string;
  dismissedAt: number;
}

function ProfileOnboardingModal({ 
  isOpen, 
  onClose, 
  userName,
  userEmail 
}: ProfileOnboardingModalProps): React.ReactNode {
  const navigate = useNavigate();
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  // 이미 온보딩 완료했거나 "나중에" 선택했는지 확인
  useEffect(() => {
    // 이미 완료한 사용자는 다시 표시 안함
    const completedEmails = localStorage.getItem(PROFILE_ONBOARDING_COMPLETED_KEY);
    if (completedEmails) {
      const emails = JSON.parse(completedEmails);
      if (emails.includes(userEmail)) {
        onClose();
        return;
      }
    }

    // "나중에" 선택한 경우 30일간 표시 안함 (이메일별 체크)
    const dismissedData = localStorage.getItem(PROFILE_ONBOARDING_DISMISS_KEY);
    if (dismissedData) {
      try {
        const dismissedUsers: DismissedUser[] = JSON.parse(dismissedData);
        const now = Date.now();
        
        // 현재 사용자의 dismiss 정보 찾기
        const userDismissInfo = dismissedUsers.find(u => u.email === userEmail);
        if (userDismissInfo && (now - userDismissInfo.dismissedAt < DISMISS_DURATION)) {
          onClose();
          return;
        }
        
        // 30일 지난 항목들 정리 (선택적 - 메모리 절약)
        const activeDissmissals = dismissedUsers.filter(
          u => now - u.dismissedAt < DISMISS_DURATION
        );
        if (activeDissmissals.length !== dismissedUsers.length) {
          localStorage.setItem(PROFILE_ONBOARDING_DISMISS_KEY, JSON.stringify(activeDissmissals));
        }
      } catch (error) {
        // 파싱 실패 시 무시하고 계속 진행
      }
    }

    // 5초 후 자동 닫기
    if (isOpen) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      setAutoCloseTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isOpen, onClose, userEmail]);

  const handleCompleteNow = () => {
    // 타이머 취소
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }

    // 온보딩 시작 표시
    const completedEmails = localStorage.getItem(PROFILE_ONBOARDING_COMPLETED_KEY);
    const emails = completedEmails ? JSON.parse(completedEmails) : [];
    if (!emails.includes(userEmail)) {
      emails.push(userEmail);
      localStorage.setItem(PROFILE_ONBOARDING_COMPLETED_KEY, JSON.stringify(emails));
    }

    // 프로필 편집 페이지로 이동
    navigate('/users/me/edit', { 
      state: { fromOnboarding: true } 
    });
    onClose();
  };

  const handleDismiss = () => {
    // 타이머 취소
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }

    // 30일간 재표시 안함 (이메일별 저장)
    const dismissedData = localStorage.getItem(PROFILE_ONBOARDING_DISMISS_KEY);
    let dismissedUsers: DismissedUser[] = [];
    
    if (dismissedData) {
      try {
        dismissedUsers = JSON.parse(dismissedData);
      } catch (error) {
        // 파싱 실패 시 빈 배열로 시작
        dismissedUsers = [];
      }
    }
    
    // 현재 사용자 dismiss 정보 업데이트 (중복 방지)
    const existingIndex = dismissedUsers.findIndex(u => u.email === userEmail);
    const newDismissInfo: DismissedUser = {
      email: userEmail,
      dismissedAt: Date.now()
    };
    
    if (existingIndex >= 0) {
      dismissedUsers[existingIndex] = newDismissInfo;
    } else {
      dismissedUsers.push(newDismissInfo);
    }
    
    localStorage.setItem(PROFILE_ONBOARDING_DISMISS_KEY, JSON.stringify(dismissedUsers));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleDismiss}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={handleDismiss}
          aria-label="닫기"
        >
          ×
        </button>
        
        <div className={styles.header}>
          <div className={styles.welcomeIcon}>🎉</div>
          <h2 className={styles.title}>
            {userName}님, 환영합니다!
          </h2>
          <p className={styles.subtitle}>
            AsyncSite 멤버가 되신 것을 축하드립니다
          </p>
        </div>
        
        <div className={styles.benefits}>
          <h3 className={styles.benefitsTitle}>
            프로필을 완성하면...
          </h3>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>🎯</span>
            <div className={styles.benefitText}>
              <strong>맞춤 스터디 추천</strong>
              <p>당신에게 딱 맞는 스터디를 찾아드려요</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>🤝</span>
            <div className={styles.benefitText}>
              <strong>스터디 승인률 UP</strong>
              <p>프로필이 충실할수록 승인 확률이 높아져요</p>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>⭐</span>
            <div className={styles.benefitText}>
              <strong>신뢰도 상승</strong>
              <p>다른 멤버들과 더 쉽게 연결될 수 있어요</p>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={handleCompleteNow}
          >
            지금 프로필 완성하기
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={handleDismiss}
          >
            나중에 하기
          </button>
        </div>
        
        <p className={styles.autoCloseNote}>
          5초 후 자동으로 닫힙니다
        </p>
      </div>
    </div>
  );
}

export default ProfileOnboardingModal;