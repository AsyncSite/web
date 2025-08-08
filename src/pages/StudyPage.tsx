import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StudyCalendar from '../components/study/StudyCalendar/StudyCalendar';
import { PaymentButton } from '../components/payment';
import { PaymentProvider } from '../contexts/PaymentContext';
import { PaymentRequest, PaymentResponse } from '../types/payment';
import EmptyState from '../components/ui/EmptyState';
import studyService, { Study } from '../api/studyService';
import './TabPage.css';

const StudyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>(
    location.pathname.includes('/calendar') ? 'calendar' : 'list'
  );
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studyService.getAllStudies();
        setStudies(data);
      } catch (err) {
        // 스터디가 없는 경우는 에러가 아니라 빈 상태로 처리
        setStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, []);

  const recruitingStudies = studies.filter(study => study.status === 'recruiting');
  const ongoingStudies = studies.filter(study => study.status === 'ongoing');
  const closedStudies = studies.filter(study => study.status === 'closed');


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
  // TODO: 프로덕션에서는 백엔드 API를 호출하여 주문번호를 받아와야 함
  const createPaymentRequest = (studyName: string, price: number): PaymentRequest => ({
    orderId: `STUDY_${Date.now()}`, // 임시 주문번호 - 백엔드에서 생성 필요
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
          
            {/* Study Actions */}
            <div className="study-actions" style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
              marginBottom: '30px'
            }}>
              <button 
                onClick={() => navigate('/study/propose')} 
                className="propose-study-btn"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  background: 'linear-gradient(135deg, #C3E88D 0%, #89DDFF 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(195, 232, 141, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(195, 232, 141, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(195, 232, 141, 0.3)';
                }}
              >
                💡 스터디 제안하기
              </button>
            </div>
          
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
            loading ? (
              <div className="loading-state">
                <div className="loading-spinner">⏳</div>
                <p>스터디를 불러오는 중...</p>
              </div>
            ) : (recruitingStudies.length === 0 && ongoingStudies.length === 0 && closedStudies.length === 0) ? (
              <EmptyState
                icon="📚"
                title="아직 등록된 스터디가 없어요"
                description="곧 새로운 스터디가 시작될 예정이에요. 조금만 기다려주세요!"
                actionButton={{
                  label: "새로고침",
                  onClick: () => window.location.reload()
                }}
              />
            ) :
            <>
              {recruitingStudies.length > 0 && (
                <section className="study-section">
                  <h2>📢 모집 중인 스터디</h2>
                  <div className="study-grid">
                    {recruitingStudies.map(study => (
                      <Link to={`/study/${study.slug}`} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>
                              {study.name}
                              {study.generation > 1 && <span className="generation">{study.generation}기</span>}
                            </h3>
                            <span className="status-badge recruiting">모집중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            {study.schedule && study.schedule !== '매주 수요일' && (
                              <span>📅 {study.schedule} {study.duration && study.duration !== '19:00-21:00' && study.duration}</span>
                            )}
                            {(study.capacity && study.capacity > 0) && (
                              <span>👥 {study.enrolled}/{study.capacity}명</span>
                            )}
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
                      <Link to={`/study/${study.slug}`} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>
                              {study.name}
                              {study.generation > 1 && <span className="generation">{study.generation}기</span>}
                            </h3>
                            <span className="status-badge ongoing">진행중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            {study.schedule && study.schedule !== '매주 수요일' && (
                              <span>📅 {study.schedule} {study.duration && study.duration !== '19:00-21:00' && study.duration}</span>
                            )}
                            {study.enrolled > 0 && (
                              <span>👥 {study.enrolled}명 참여중</span>
                            )}
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
                          <h3>
                            {study.name}
                            {study.generation > 1 && <span className="generation">{study.generation}기</span>}
                          </h3>
                          <span className="status-badge closed">종료</span>
                        </div>
                        <p className="study-tagline">{study.tagline}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 결제 시스템 테스트 섹션 (임시) */}
              <div className="payment-test-section" style={{
                marginTop: '40px',
                padding: '24px',
                background: 'rgba(195, 232, 141, 0.05)',
                border: '1px solid rgba(195, 232, 141, 0.2)',
                borderRadius: '16px',
                minHeight: 'auto',
                width: '100%'
              }}>
                <h2 style={{ color: '#c3e88d', marginBottom: '16px' }}>💳 결제 시스템 테스트</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px' }}>
                  통합 결제 UI를 테스트해보세요. 실제 결제는 이루어지지 않습니다.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* 다양한 스타일의 결제 버튼 */}
                  <PaymentButton
                    variant="primary"
                    size="medium"
                    label="테코테코 3기 참가 신청"
                    request={createPaymentRequest('테코테코 3기', 50000)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />

                  <PaymentButton
                    variant="secondary"
                    size="medium"
                    label="11루틴 2기 (무료)"
                    request={createPaymentRequest('11루틴 2기', 0)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />

                  <PaymentButton
                    variant="gradient"
                    size="large"
                    icon="✨"
                    request={createPaymentRequest('프리미엄 멘토링', 150000)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    showPrice={true}
                    pricePrefix="프리미엄"
                  />

                  <PaymentButton
                    variant="outline"
                    size="small"
                    label="₩30,000 결제 테스트"
                    request={createPaymentRequest('일반 스터디', 30000)}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>

                <div style={{ marginTop: '24px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  <p>💡 이 버튼들은 나중에 스터디 상세 페이지나 AI 이력서 서비스에서 사용됩니다.</p>
                  <p>💡 토스페이먼츠 테스트 모드로 동작하며, 실제 결제는 이루어지지 않습니다.</p>
                </div>
              </div>
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
