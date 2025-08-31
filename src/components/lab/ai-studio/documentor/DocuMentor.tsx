import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DocuMentorForm from './DocuMentorForm';
import HeroSection from './HeroSection';
import ChatBubbles from './ChatBubbles';
import ExampleCard from './ExampleCard';
import FeaturesSection from './FeaturesSection';
import UserReviews from './UserReviews';
import { DocuMentorContent, DocuMentorAnalysis, DocuMentorStats, MOCK_REVIEW } from './types';
import documentorService from '../../../../services/documentorService';
import styles from './DocuMentor.module.css';

function DocuMentor(): React.ReactNode {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [currentView, setCurrentView] = useState<'form' | 'processing'>('form');
  const [submittedContent, setSubmittedContent] = useState<DocuMentorContent | null>(null);
  const [stats, setStats] = useState<DocuMentorStats>({
    dailyLimit: 5,
    usedToday: 2,
    remainingToday: 3,
    resetTime: '00:00',
    totalSubmissions: 12,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<'submitting' | 'crawling' | 'analyzing' | 'complete'>('submitting');
  
  // Check if user has used trial
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  
  // Check trial usage on mount
  useEffect(() => {
    const trialEmails = localStorage.getItem('documento_trial_emails');
    if (trialEmails) {
      // In real implementation, check if current user's email is in the list
      // For now, just check if any trial was used
      setHasUsedTrial(true);
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
          // TODO: Replace with real API call
          // const userStats = await documentoService.getStats();
          // setStats(userStats);
        } catch (err) {
          console.error('Failed to load stats:', err);
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
      
      // Check if this email already used trial
      const trialEmails = JSON.parse(localStorage.getItem('documento_trial_emails') || '[]');
      if (trialEmails.includes(email)) {
        setHasUsedTrial(true);
        setError('이미 무료 체험을 사용하셨습니다. 회원가입 후 이용해주세요!');
        return;
      }
      
      // Save email to trial list
      trialEmails.push(email);
      localStorage.setItem('documento_trial_emails', JSON.stringify(trialEmails));
    } else if (stats.remainingToday === 0) {
      setError('오늘 사용 가능한 횟수를 모두 사용하셨습니다. 자정에 다시 시도해주세요!');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentView('processing');
    setProcessingStep('submitting');

    try {
      // Simulate API call with mock data for now
      // TODO: Replace with real API call
      // const content = await documentoService.submitUrl({ url, notification });
      
      // Mock processing flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStep('crawling');
      
      const mockContent: DocuMentorContent = {
        id: 'mock-' + Date.now(),
        url,
        status: 'CRAWLING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSubmittedContent(mockContent);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessingStep('analyzing');
      mockContent.status = 'PARSING';
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      setProcessingStep('complete');
      mockContent.status = 'COMPLETED';
      
      // After processing, go back to form
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentView('form');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        usedToday: prev.usedToday + 1,
        remainingToday: prev.remainingToday - 1,
        totalSubmissions: prev.totalSubmissions + 1,
      }));
      
    } catch (err: any) {
      setError(err.message || '처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setCurrentView('form');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentView('form');
    setSubmittedContent(null);
    setError(null);
    setProcessingStep('submitting');
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
            
            {/* Form - Moved After Chat */}
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

        {currentView === 'processing' && (
          <div className={styles.processingContainer}>
            <div className={styles.processingCard}>
              <div className={styles.processingEmoji}>
                {processingStep === 'submitting' && '📤'}
                {processingStep === 'crawling' && '🔍'}
                {processingStep === 'analyzing' && '🤖'}
                {processingStep === 'complete' && '✅'}
              </div>
              
              <h2 className={styles.processingTitle}>
                {processingStep === 'submitting' && 'URL을 제출하고 있어요...'}
                {processingStep === 'crawling' && '글을 읽어오고 있어요...'}
                {processingStep === 'analyzing' && 'AI가 분석하고 있어요...'}
                {processingStep === 'complete' && '분석이 완료되었어요!'}
              </h2>
              
              <div className={styles.processingSteps}>
                <div className={`${styles.step} ${processingStep !== 'submitting' ? styles.completed : styles.active}`}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepLabel}>제출</span>
                </div>
                <div className={`${styles.step} ${processingStep === 'analyzing' || processingStep === 'complete' ? styles.completed : processingStep === 'crawling' ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepLabel}>크롤링</span>
                </div>
                <div className={`${styles.step} ${processingStep === 'complete' ? styles.completed : processingStep === 'analyzing' ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepLabel}>분석</span>
                </div>
                <div className={`${styles.step} ${processingStep === 'complete' ? styles.completed : ''}`}>
                  <span className={styles.stepNumber}>4</span>
                  <span className={styles.stepLabel}>완료</span>
                </div>
              </div>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{
                    width: processingStep === 'submitting' ? '25%' :
                           processingStep === 'crawling' ? '50%' :
                           processingStep === 'analyzing' ? '75%' : '100%'
                  }}
                />
              </div>
              
              <p className={styles.processingHint}>
                {processingStep === 'submitting' && '서버와 통신 중이에요...'}
                {processingStep === 'crawling' && '페이지 내용을 추출하고 있어요...'}
                {processingStep === 'analyzing' && '10가지 항목을 체크하고 있어요...'}
                {processingStep === 'complete' && '곧 결과를 보여드릴게요!'}
              </p>
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