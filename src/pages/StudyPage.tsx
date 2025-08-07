import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { STUDY_LIST, getStudyUrl } from '../constants/studies';
import StudyCalendar from '../components/study/StudyCalendar/StudyCalendar';
import { PaymentButton } from '../components/payment';
import { PaymentProvider } from '../contexts/PaymentContext';
import { PaymentRequest, PaymentResponse } from '../types/payment';
import './TabPage.css';

const StudyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>(
    location.pathname.includes('/calendar') ? 'calendar' : 'list'
  );
  
  const recruitingStudies = STUDY_LIST.filter(study => study.status === 'recruiting');
  const ongoingStudies = STUDY_LIST.filter(study => study.status === 'ongoing');
  const closedStudies = STUDY_LIST.filter(study => study.status === 'closed');

  const handleTabChange = (tab: 'list' | 'calendar') => {
    setActiveTab(tab);
    navigate(tab === 'calendar' ? '/study/calendar' : '/study');
  };

  // 결제 성공 핸들러
  const handlePaymentSuccess = (payment: PaymentResponse) => {
    console.log('Payment successful:', payment);
    alert(`결제가 완료되었습니다!\n주문번호: ${payment.orderId}\n금액: ${payment.amount.final.toLocaleString()}원`);
  };

  // 결제 에러 핸들러
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    alert('결제 처리 중 오류가 발생했습니다.');
  };

  // 테스트용 결제 요청 데이터
  const createPaymentRequest = (studyName: string, price: number): PaymentRequest => ({
    orderId: `STUDY_${Date.now()}`,
    orderName: studyName,
    amount: {
      original: price,
      discount: price >= 50000 ? 10000 : 0,
      final: price >= 50000 ? price - 10000 : price,
      currency: 'KRW'
    },
    items: [{
      id: '1',
      name: studyName,
      description: '온라인 개발 스터디',
      quantity: 1,
      price: price
    }],
    customer: {
      id: 'user_123',
      name: '테스트 사용자',
      email: 'test@asyncsite.com'
    },
    metadata: {
      studyType: 'online',
      promotionCode: price >= 50000 ? 'EARLYBIRD' : undefined
    }
  });

  return (
    <PaymentProvider>
      <div className="page-container">
        <main className="page-content">
          <div className="study-list-page">
            <h1>STUDY</h1>
            <p className="page-description">함께 성장하는 개발자들의 커뮤니티</p>
          
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => handleTabChange('list')}
              >
                <span className="tab-icon">📚</span>
                스터디 목록
              </button>
              <button
                className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => handleTabChange('calendar')}
              >
                <span className="tab-icon">📅</span>
                일정 캘린더
              </button>
            </div>
          
          {/* Tab Content */}
          {activeTab === 'list' ? (
            <>
              {recruitingStudies.length > 0 && (
                <section className="study-section">
                  <h2>📢 모집 중인 스터디</h2>
                  <div className="study-grid">
                    {recruitingStudies.map(study => (
                      <Link to={getStudyUrl(study)} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                            <span className="status-badge recruiting">모집중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            <span>📅 {study.schedule}</span>
                            <span>👥 {study.enrolled}/{study.capacity}명</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {ongoingStudies.length > 0 && (
                <section className="study-section">
                  <h2>🚀 진행 중인 스터디</h2>
                  <div className="study-grid">
                    {ongoingStudies.map(study => (
                      <Link to={getStudyUrl(study)} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                            <span className="status-badge ongoing">진행중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            <span>📅 {study.schedule}</span>
                            <span>👥 {study.enrolled}명 참여중</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {closedStudies.length > 0 && (
                <section className="study-section">
                  <h2>🏁 종료된 스터디</h2>
                  <div className="study-grid">
                    {closedStudies.map(study => (
                      <div key={study.id} className="study-card disabled">
                        <div className="study-header">
                          <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                          <span className="status-badge closed">종료</span>
                        </div>
                        <p className="study-tagline">{study.tagline}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* 결제 시스템 테스트 섹션 (임시) */}
              <section style={{
                marginTop: '30px',
                padding: '16px',
                background: 'rgba(195, 232, 141, 0.03)',
                border: '1px solid rgba(195, 232, 141, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <h3 style={{ 
                    color: '#c3e88d', 
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    💳 결제 테스트
                  </h3>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255, 255, 255, 0.4)',
                    padding: '2px 8px',
                    background: 'rgba(130, 170, 255, 0.1)',
                    borderRadius: '4px'
                  }}>
                    개발 모드
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  flexWrap: 'wrap',
                  marginBottom: '12px'
                }}>
                  <PaymentButton
                    variant="primary"
                    size="small"
                    label="스터디 결제"
                    request={createPaymentRequest('테코테코 3기', 50000)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <PaymentButton
                    variant="secondary"
                    size="small"
                    label="무료 신청"
                    request={createPaymentRequest('11루틴 2기', 0)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <PaymentButton
                    variant="outline"
                    size="small"
                    label="테스트 결제"
                    request={createPaymentRequest('일반 스터디', 30000)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
                
                <p style={{ 
                  fontSize: '11px', 
                  color: 'rgba(255, 255, 255, 0.3)',
                  margin: 0
                }}>
                  토스페이먼츠 테스트 모드 • 실제 결제 X
                </p>
              </section>
            </>
          ) : (
            <StudyCalendar />
          )}
          </div>
        </main>
      </div>
    </PaymentProvider>
  );
};

export default StudyPage;
