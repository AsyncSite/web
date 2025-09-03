import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DocuMentorForm from './DocuMentorForm';
import HeroSection from './HeroSection';
import ChatBubbles from './ChatBubbles';
import ExampleCard from './ExampleCard';
import FeaturesSection from './FeaturesSection';
import UserReviews from './UserReviews';
import ActivityCarousel from './ActivityCarousel';
import { DocuMentorContent, DocuMentorAnalysis, DocuMentorStats, MOCK_REVIEW } from './types';
import documentorService from '../../../../services/documentorService';
import styles from './DocuMentor.module.css';

function DocuMentor(): React.ReactNode {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [currentView, setCurrentView] = useState<'form' | 'success'>('form');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<DocuMentorStats>({
    dailyLimit: 5,
    usedToday: 0,
    remainingToday: 5,
    resetTime: '00:00',
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user has used trial
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  
  // Check trial usage on mount
  useEffect(() => {
    const trialEmails = localStorage.getItem('documento_trial_emails');
    if (trialEmails) {
      try {
        const emailList = JSON.parse(trialEmails);
        // If any trials have been used from this browser, show the appropriate UI
        // Note: We can't match against a specific email since user hasn't entered it yet
        if (emailList && emailList.length > 0) {
          setHasUsedTrial(true);
        }
      } catch (e) {
        // If parsing fails, clean up localStorage
        localStorage.removeItem('documento_trial_emails');
      }
    }
  }, []);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      // Store return URL for after login
      sessionStorage.setItem('documentor_return_url', '/lab/documentor');
    }
  }, [isAuthenticated]);

  // Load user stats
  useEffect(() => {
    const loadStats = async () => {
      if (isAuthenticated) {
        try {
          const userStats = await documentorService.getStats();
          console.log('Stats API 응답:', userStats); // 디버깅용
          setStats(userStats);
        } catch (err) {
          console.error('Stats API 호출 실패:', err);
          // API 실패 시에도 기본값 유지하되 사용자에게 알림
          // setError('사용 통계를 불러올 수 없습니다.');
        }
      }
    };
    loadStats();
  }, [isAuthenticated]);

  const handleSubmit = async (url: string, email?: string, tone?: string, purpose?: string, audience?: string) => {
    // Handle trial submission for non-authenticated users
    if (!isAuthenticated) {
      if (!email) {
        setError('이메일을 입력해주세요');
        return;
      }
      
      // Remove localStorage check - let backend handle trial limits
      // Backend will track by email hash and return proper error
    } else if (stats.remainingToday === 0) {
      setError('오늘 사용 가능한 횟수를 모두 사용하셨습니다. 자정에 다시 시도해주세요!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Submit URL to backend - different endpoints for authenticated vs trial
      if (!isAuthenticated && email) {
        // Trial submission
        await documentorService.submitTrialUrl(email, url, tone, purpose, audience);
        
        // Update localStorage to track trial usage
        const trialEmails = localStorage.getItem('documento_trial_emails');
        const emailList = trialEmails ? JSON.parse(trialEmails) : [];
        if (!emailList.includes(email)) {
          emailList.push(email);
          localStorage.setItem('documento_trial_emails', JSON.stringify(emailList));
          setHasUsedTrial(true);
        }
        setSubmittedEmail(email);
      } else {
        // Authenticated submission
        await documentorService.submitUrl({ url, tone, purpose, audience });
        setSubmittedEmail(user?.email || null);
      }
      
      // Show success view immediately
      setCurrentView('success');
      
      // Reload stats to get updated counts
      if (isAuthenticated) {
        try {
          const updatedStats = await documentorService.getStats();
          console.log('제출 후 stats 업데이트:', updatedStats);
          setStats(updatedStats);
        } catch (statsError) {
          console.error('Stats 업데이트 실패:', statsError);
          // Fallback to manual update
          setStats(prev => ({
            ...prev,
            usedToday: prev.usedToday + 1,
            remainingToday: Math.max(0, prev.remainingToday - 1),
            totalSubmissions: prev.totalSubmissions + 1,
          }));
        }
      }
      
    } catch (err: any) {
      setError(err.message || '처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setCurrentView('form');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentView('form');
    setSubmittedEmail(null);
    setError(null);
  };


  return (
    <div className={styles.documento}>
      {/* Hero Section */}
      <HeroSection isAuthenticated={isAuthenticated} user={user} />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {currentView === 'form' && (
          <>
            {/* Chat Bubbles - Now First */}
            <ChatBubbles />
            
            {/* Activity Carousel - Before CTA */}
            <ActivityCarousel />
            
            {/* Form - CTA */}
            <DocuMentorForm
              onSubmit={handleSubmit}
              stats={stats}
              isAuthenticated={isAuthenticated}
              loading={loading}
              error={error}
              hasUsedTrial={hasUsedTrial}
            />
          </>
        )}

        {currentView === 'success' && (
          <div className={styles.successContainer}>
            <div className={styles.successCard}>
              <div className={styles.successEmoji}>✉️</div>
              
              <h2 className={styles.successTitle}>
                제출이 완료되었습니다!
              </h2>
              
              <div className={styles.successMessage}>
                <p className={styles.mainMessage}>
                  AI가 글을 분석하고 있어요.<br />
                  <strong>{submittedEmail}</strong>로 결과를 보내드릴게요.
                </p>
                
                <div className={styles.timeInfo}>
                  <p className={styles.expectedTime}>
                    📧 예상 도착 시간: <strong>10-20분</strong>
                  </p>
                  <p className={styles.disclaimer}>
                    * 서버 상황에 따라 최대 24시간까지 소요될 수 있습니다.
                  </p>
                </div>
                
                <div className={styles.tipBox}>
                  <p className={styles.tipTitle}>💡 Tip</p>
                  <ul className={styles.tipList}>
                    <li>스팸 메일함도 확인해주세요</li>
                    <li>이메일이 도착하지 않으면 24시간 후 다시 시도해주세요</li>
                  </ul>
                </div>
              </div>
              
              <button
                className={styles.newSubmitButton}
                onClick={() => {
                  setCurrentView('form');
                  setSubmittedEmail(null);
                }}
              >
                🔄 다른 글 분석하기
              </button>
            </div>
          </div>
        )}

        {/* Features and Example Sections */}
        {currentView === 'form' && (
          <>
            <FeaturesSection />
            <ExampleCard />
            <UserReviews />
          </>
        )}
      </div>
    </div>
  );
}

export default DocuMentor;