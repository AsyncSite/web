import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DocuMentorForm from './DocuMentorForm';
import DocuMentorResults from './DocuMentorResults';
import HeroSection from './HeroSection';
import ChatBubbles from './ChatBubbles';
import ExampleCard from './ExampleCard';
import { DocuMentorContent, DocuMentorAnalysis, DocuMentorStats, MOCK_REVIEW } from './types';
import documentorService from '../../../../services/documentorService';
import styles from './DocuMentor.module.css';

function DocuMentor(): React.ReactNode {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [currentView, setCurrentView] = useState<'form' | 'processing' | 'results'>('form');
  const [submittedContent, setSubmittedContent] = useState<DocuMentorContent | null>(null);
  const [analysis, setAnalysis] = useState<DocuMentorAnalysis | null>(null);
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

  const handleSubmit = async (url: string, tone?: string, purpose?: string, audience?: string) => {
    if (!isAuthenticated) {
      if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        sessionStorage.setItem('documentor_return_url', '/lab/documentor');
        navigate('/login');
      }
      return;
    }

    if (stats.remainingToday === 0) {
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
      
      // Set mock analysis result
      setAnalysis(MOCK_REVIEW);
      setCurrentView('results');
      
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
    setAnalysis(null);
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
            <DocuMentorForm
              onSubmit={handleSubmit}
              stats={stats}
              isAuthenticated={isAuthenticated}
              loading={loading}
              error={error}
            />
            
            {/* Chat Bubbles - Moved Down */}
            <ChatBubbles />
            
            {/* Example Review Card */}
            <ExampleCard />
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

        {currentView === 'results' && analysis && (
          <DocuMentorResults
            content={submittedContent!}
            analysis={analysis}
            onReset={handleReset}
          />
        )}

        {/* Features Section */}
        {currentView === 'form' && (
          <div className={styles.features}>
          <h2 className={styles.featuresTitle}>뭘 봐주는데요? 🤔</h2>
          
          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>🎯</div>
              <h3 className={styles.featureName}>제목 어필력</h3>
              <p className={styles.featureDesc}>클릭하고 싶은 제목인지 체크해요</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>🎨</div>
              <h3 className={styles.featureName}>첫인상 분석</h3>
              <p className={styles.featureDesc}>도입부가 흥미로운지 평가해요</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>📚</div>
              <h3 className={styles.featureName}>가독성 점수</h3>
              <p className={styles.featureDesc}>술술 읽히는 글인지 확인해요</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>🎭</div>
              <h3 className={styles.featureName}>감정 톤</h3>
              <p className={styles.featureDesc}>글의 분위기가 적절한지 봐요</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>🏗️</div>
              <h3 className={styles.featureName}>구조 체크</h3>
              <p className={styles.featureDesc}>논리적 흐름을 점검해요</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureEmoji}>💡</div>
              <h3 className={styles.featureName}>개선 제안</h3>
              <p className={styles.featureDesc}>구체적인 수정 방법을 알려드려요</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default DocuMentor;