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
          setStats(userStats);
        } catch (err) {
          console.error('Failed to load stats:', err);
          // Keep default stats if API fails
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
    setCurrentView('processing');
    setProcessingStep('submitting');

    try {
      // Submit URL to backend - different endpoints for authenticated vs trial
      let content;
      if (!isAuthenticated && email) {
        // Trial submission
        content = await documentorService.submitTrialUrl(email, url, tone, purpose, audience);
        
        // Update localStorage to track trial usage
        const trialEmails = localStorage.getItem('documento_trial_emails');
        const emailList = trialEmails ? JSON.parse(trialEmails) : [];
        if (!emailList.includes(email)) {
          emailList.push(email);
          localStorage.setItem('documento_trial_emails', JSON.stringify(emailList));
          setHasUsedTrial(true);
        }
      } else {
        // Authenticated submission
        content = await documentorService.submitUrl({ url, tone, purpose, audience });
      }
      setSubmittedContent(content);
      
      // Poll for status updates
      let currentStatus = content.status;
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes max (60 * 3 seconds)
      
      while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && attempts < maxAttempts) {
        // Update UI based on status
        if (currentStatus === 'SUBMITTED') {
          setProcessingStep('submitting');
        } else if (currentStatus === 'CRAWLING') {
          setProcessingStep('crawling');
        } else if (currentStatus === 'PARSING') {
          setProcessingStep('analyzing');
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Poll for updated status
        try {
          const updatedContent = !isAuthenticated && email
            ? await documentorService.getTrialContent(content.id, email)
            : await documentorService.getContent(content.id);
          currentStatus = updatedContent.status;
          setSubmittedContent(updatedContent);
          attempts++;
        } catch (pollError) {
          console.error('Failed to poll status:', pollError);
          attempts++;
        }
      }
      
      // Final status update
      if (currentStatus === 'COMPLETED') {
        setProcessingStep('complete');
        // Wait a bit to show completion
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (currentStatus === 'FAILED') {
        throw new Error('콘텐츠 처리 중 오류가 발생했습니다.');
      } else {
        throw new Error('처리 시간이 초과되었습니다. 나중에 다시 확인해주세요.');
      }
      
      // After processing, go back to form
      setCurrentView('form');
      
      // Reload stats to get updated counts
      if (isAuthenticated) {
        try {
          const updatedStats = await documentorService.getStats();
          setStats(updatedStats);
        } catch (statsError) {
          console.error('Failed to reload stats:', statsError);
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