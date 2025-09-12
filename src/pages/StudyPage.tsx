import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import StudyCalendar from '../components/study/StudyCalendar/StudyCalendar';
import { CheckoutButton } from '../components/UnifiedCheckout';
import { 
  createStudyCheckoutRequest,
  CheckoutResponse,
  CheckoutError
} from '../types/checkout';
import EmptyState from '../components/ui/EmptyState';
import studyService, { Study } from '../api/studyService';
import { useAuth } from '../contexts/AuthContext';
import { getStudyDisplayInfo } from '../utils/studyStatusUtils';
import { parseDate } from '../utils/studyScheduleUtils';
import styles from './StudyPage.module.css';

const StudyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // 필터와 뷰 상태 분리
  const [statusFilter, setStatusFilter] = useState<'all' | 'recruiting' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(
    location.pathname.includes('/calendar') ? 'calendar' : 'list'
  );
  
  const [studies, setStudies] = useState<Study[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [myStudies, setMyStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studyService.getAllStudies();
        setStudies(data);
        
        // 로그인한 경우에만 내 신청과 스터디 정보 가져오기
        if (isAuthenticated && user) {
          try {
            const [applications, userStudies] = await Promise.all([
              studyService.getMyApplications(),
              studyService.getMyMemberships()
            ]);
            setMyApplications(applications);
            setMyStudies(userStudies);
          } catch (err) {
            console.error('Failed to fetch user study data:', err);
            // 사용자 데이터 실패는 무시 (로그인하지 않은 사용자도 있음)
          }
        }
      } catch (err) {
        // 스터디가 없는 경우는 에러가 아니라 빈 상태로 처리
        setStudies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [isAuthenticated, user]);

  // 스터디별 상태 확인 헬퍼 함수
  const getStudyUserStatus = (studyId: string) => {
    // 멤버인지 확인
    const isMember = myStudies.some(s => s.studyId === studyId);
    if (isMember) {
      return { status: 'member', applicationId: null };
    }
    
    // 신청 상태 확인
    const application = myApplications.find(app => app.studyId === studyId);
    if (application) {
      if (application.status === 'PENDING') {
        return { status: 'pending', applicationId: application.applicationId };
      } else if (application.status === 'ACCEPTED') {
        return { status: 'accepted', applicationId: application.applicationId };
      } else if (application.status === 'REJECTED') {
        return { status: 'rejected', applicationId: application.applicationId };
      }
    }
    
    return { status: 'none', applicationId: null };
  };

  const now = new Date();
  
  // 각 카테고리별 스터디 필터링
  const recruitingStudies = studies.filter(study => {
    const displayInfo = getStudyDisplayInfo(
      study.status, 
      study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
    );
    return displayInfo.canApply;
  });
  
  const upcomingStudies = studies.filter(study => {
    const displayInfo = getStudyDisplayInfo(
      study.status,
      study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
    );
    const startDate = parseDate(study.startDate);
    return study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now;
  });
  
  const ongoingStudies = studies.filter(study => study.status === 'IN_PROGRESS');
  const completedStudies = studies.filter(study => study.status === 'COMPLETED');
  
  // 필터에 따른 스터디 목록 결정
  const getFilteredStudies = () => {
    switch (statusFilter) {
      case 'recruiting':
        return recruitingStudies;
      case 'upcoming':
        return upcomingStudies;
      case 'ongoing':
        return ongoingStudies;
      case 'completed':
        return completedStudies;
      case 'all':
      default:
        // PENDING(승인 대기), TERMINATED(중도 종료) 제외
        return studies.filter(study => 
          study.status !== 'PENDING' && study.status !== 'TERMINATED'
        );
    }
  };
  
  const filteredStudies = getFilteredStudies();
  
  // 스터디 정렬: 시작예정 → 모집중 → 진행중 → 완료 순서로 정렬
  const sortedStudies = [...filteredStudies].sort((a, b) => {
    // 각 스터디의 상태 우선순위 계산
    const getPriority = (study: Study): number => {
      const displayInfo = getStudyDisplayInfo(
        study.status,
        study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
      );
      
      // 시작예정 (가장 높은 우선순위)
      const startDate = parseDate(study.startDate);
      if (study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now) {
        return 0;
      }
      
      // 모집중
      if (displayInfo.canApply) {
        return 1;
      }
      
      // 진행중
      if (study.status === 'IN_PROGRESS') {
        return 2;
      }
      
      // 완료
      if (study.status === 'COMPLETED') {
        return 3;
      }
      
      // 기타 (마감 등)
      return 4;
    };
    
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    
    // 우선순위가 같으면 generation(기수) 내림차순으로 정렬
    if (priorityA === priorityB) {
      return (b.generation || 0) - (a.generation || 0);
    }
    
    return priorityA - priorityB;
  });
  
  // 스터디 상태에 따른 배지 클래스 결정
  const getStatusBadgeClass = (study: Study): string => {
    const displayInfo = getStudyDisplayInfo(
      study.status,
      study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
    );
    
    if (displayInfo.canApply) return 'recruiting';
    if (study.status === 'IN_PROGRESS') return 'ongoing';
    if (study.status === 'COMPLETED' || study.status === 'TERMINATED') return 'closed';
    
    // Upcoming 체크
    const startDate = parseDate(study.startDate);
    if (study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now) {
      return 'upcoming';
    }
    
    return 'closed';
  };
  
  // 스터디 상태 라벨 결정
  const getStatusLabel = (study: Study): string => {
    const displayInfo = getStudyDisplayInfo(
      study.status,
      study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline
    );
    
    if (displayInfo.canApply) return '모집중';
    if (study.status === 'IN_PROGRESS') return '진행중';
    if (study.status === 'COMPLETED') return '완료';
    
    // Upcoming 체크
    const startDate = parseDate(study.startDate);
    if (study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now) {
      return '시작예정';
    }
    
    return '마감';
  };


  const handleViewChange = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    navigate(mode === 'calendar' ? '/study/calendar' : '/study');
  };

  // 결제 성공 핸들러
  const handleCheckoutComplete = (response: CheckoutResponse) => {
    console.log('Checkout completed:', response);
    alert(`결제가 시작되었습니다!\nCheckout ID: ${response.checkoutId}\n상태: ${response.status}`);
  };

  // 결제 에러 핸들러
  const handleCheckoutError = (error: CheckoutError) => {
    console.error('Checkout error:', error);
    alert('결제 처리 중 오류가 발생했습니다.');
  };

  // 테스트용 스터디 결제 요청 데이터 생성
  const createStudyCheckoutData = (studyName: string, price: number) => {
    return createStudyCheckoutRequest({
      studyId: `study-${Date.now()}`,
      studyName: studyName,
      price: price,
      discountRate: price >= 50000 ? 20 : 0, // 5만원 이상일 때 20% 할인
      customerName: '테스트 사용자',
      customerEmail: 'test@asyncsite.com',
      customerPhone: '010-1234-5678',
      cohortId: `cohort-${Date.now()}`,
      cohortName: '테스트 기수',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 후
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 60일 후
    });
  };

  return (
    <div className={styles['page-container']}>
        <main className={styles['page-content']}>
          <div className={styles['study-list-page']}>
            <h1>STUDY</h1>
            <p className={styles['page-description']}>함께 성장하는 개발자들의 커뮤니티</p>
          
            {/* Study Actions */}
            <div className={styles['study-actions']}>
              <button 
                onClick={() => navigate('/study/propose')} 
                className={styles['propose-study-btn']}
              >
                💡 스터디 제안하기
              </button>
            </div>
          
            {/* Filter and View Bar */}
            <div className={styles['filter-view-bar']}>
              {/* Status Filters */}
              <div className={styles['filter-group']}>
                <button
                  className={`${styles['filter-button']} ${statusFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  전체
                </button>
                <button
                  className={`${styles['filter-button']} ${statusFilter === 'recruiting' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('recruiting')}
                >
                  <span className={styles['filter-icon']}>📢</span>
                  모집중
                </button>
                <button
                  className={`${styles['filter-button']} ${statusFilter === 'upcoming' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('upcoming')}
                >
                  <span className={styles['filter-icon']}>⏳</span>
                  시작예정
                </button>
                <button
                  className={`${styles['filter-button']} ${statusFilter === 'ongoing' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('ongoing')}
                >
                  <span className={styles['filter-icon']}>🚀</span>
                  진행중
                </button>
                <button
                  className={`${styles['filter-button']} ${statusFilter === 'completed' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  <span className={styles['filter-icon']}>🏁</span>
                  완료
                </button>
              </div>
              
              {/* View Mode Toggle */}
              <div className={styles['view-toggle']}>
                <button
                  className={`${styles['view-button']} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => handleViewChange('list')}
                >
                  <span className={styles['view-icon']}>📚</span>
                  목록
                </button>
                <button
                  className={`${styles['view-button']} ${viewMode === 'calendar' ? styles.active : ''}`}
                  onClick={() => handleViewChange('calendar')}
                >
                  <span className={styles['view-icon']}>📅</span>
                  캘린더
                </button>
              </div>
            </div>
          
          {/* View Content */}
          {viewMode === 'list' ? (
            loading ? (
              <div className={styles['loading-state']}>
                <div className={styles['loading-spinner']}>⏳</div>
                <p>스터디를 불러오는 중...</p>
              </div>
            ) : sortedStudies.length === 0 ? (
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
              {/* 필터에 따른 동적 렌더링 */}
              <section className={styles['study-section']}>
                {statusFilter === 'all' && <h2>전체 스터디</h2>}
                {statusFilter === 'recruiting' && <h2>📢 모집 중인 스터디</h2>}
                {statusFilter === 'upcoming' && <h2>⏳ 시작 예정 스터디</h2>}
                {statusFilter === 'ongoing' && <h2>🚀 진행 중인 스터디</h2>}
                {statusFilter === 'completed' && <h2>🏁 완료된 스터디</h2>}
                
                <div className={styles['study-grid']}>
                  {sortedStudies.map(study => {
                    const statusClass = getStatusBadgeClass(study);
                    const enrollmentRate = study.capacity ? (study.enrolled / study.capacity) * 100 : 0;
                    const daysLeft = study.deadline ? Math.ceil((study.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return (
                      <div key={study.id} className={styles['study-card-wrapper']}>
                        <Link to={`/study/${study.slug}`} className={styles['study-card-link']}>
                          <div className={`${styles['study-card']} ${styles[`card-${statusClass}`]}`}>
                            {/* 상단 헤더 영역 */}
                            <div className={styles['card-header']}>
                              <span className={`${styles['status-indicator']} ${styles[statusClass]}`}>
                                {statusClass === 'recruiting' && '🔥 '}
                                {statusClass === 'ongoing' && '🚀 '}
                                {statusClass === 'upcoming' && '⏳ '}
                                {statusClass === 'closed' && '✅ '}
                                {getStatusLabel(study)}
                              </span>
                              {daysLeft !== null && daysLeft >= 0 && statusClass === 'recruiting' && (
                                <span className={styles['deadline-badge']}>
                                  D-{daysLeft}
                                </span>
                              )}
                            </div>
                            
                            {/* 메인 콘텐츠 영역 */}
                            <div className={styles['card-content']}>
                              <h3 className={styles['study-title']}>
                                {study.name}
                                {study.generation > 1 && <span className={styles['generation-badge']}> {study.generation}기</span>}
                              </h3>
                              <p className={styles['study-tagline']}>{study.tagline}</p>
                              
                              {/* 정원 진행률 바 */}
                              {study.capacity > 0 && (
                                <div className={styles['enrollment-section']}>
                                  <div className={styles['enrollment-bar']}>
                                    <div 
                                      className={styles['enrollment-fill']} 
                                      style={{ width: `${Math.min(enrollmentRate, 100)}%` }}
                                    />
                                  </div>
                                  <span className={styles['enrollment-text']}>
                                    👥 {study.enrolled}/{study.capacity}명 ({Math.round(enrollmentRate)}%)
                                  </span>
                                </div>
                              )}
                              
                              {/* 메타 정보 */}
                              <div className={styles['card-meta']}>
                                {study.schedule && (
                                  <div className={styles['meta-item']}>
                                    <span className={styles['meta-icon']}>📅</span>
                                    <span>{study.schedule} {study.duration && ` ${study.duration}`}</span>
                                  </div>
                                )}
                                {study.recurrenceType && (
                                  <div className={styles['meta-tag']}>
                                    {study.recurrenceType === 'WEEKLY' && '매주'}
                                    {study.recurrenceType === 'BIWEEKLY' && '격주'}
                                    {study.recurrenceType === 'ONE_TIME' && '단기'}
                                  </div>
                                )}
                                {study.costType && study.costType !== 'FREE' && (
                                  <div className={styles['meta-tag']}>
                                    {study.costType === 'PAID' && '💰 유료'}
                                    {study.costType === 'FREE_WITH_VENUE' && '📍 장소비'}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* 호버 오버레이 */}
                            <div className={styles['card-overlay']}>
                              <span>자세히 보기 →</span>
                            </div>
                          </div>
                        </Link>
                        <div className={styles['study-actions']}>
                          {(() => {
                            // 스터디 제안자인 경우
                            if (isAuthenticated && user && study.proposerId === user.email) {
                              return (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/study/${study.id}/manage`);
                                  }}
                                  className={styles['manage-button']}
                                >
                                  🎛️ 스터디 관리
                                </button>
                              );
                            }
                            
                            // 사용자 상태 확인
                            const userStatus = getStudyUserStatus(study.id);
                            
                            // 이미 멤버인 경우
                            if (userStatus.status === 'member' || userStatus.status === 'accepted') {
                              return (
                                <button 
                                  disabled
                                  className={`${styles['apply-button']} ${styles['apply-button-member']}`}
                                >
                                  ✅ 참여 중
                                </button>
                              );
                            }
                            
                            // 신청 대기 중인 경우
                            if (userStatus.status === 'pending') {
                              return (
                                <div className={styles['application-actions']}>
                                  <button 
                                    disabled
                                    className={`${styles['apply-button']} ${styles['apply-button-pending']}`}
                                  >
                                    ⏳ 심사 대기중
                                  </button>
                                  <button 
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      if (window.confirm('신청을 취소하시겠습니까?')) {
                                        try {
                                          const userIdentifier = user?.email || user?.username || '';
                                          await studyService.cancelApplication(study.id, userStatus.applicationId!, userIdentifier);
                                          // 페이지 새로고침
                                          window.location.reload();
                                        } catch (err) {
                                          console.error('Failed to cancel application:', err);
                                          alert('신청 취소에 실패했습니다.');
                                        }
                                      }
                                    }}
                                    className={styles['cancel-button']}
                                  >
                                    취소
                                  </button>
                                </div>
                              );
                            }
                            
                            // 거절된 경우
                            if (userStatus.status === 'rejected') {
                              return (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/study/${study.slug}/apply`);
                                  }}
                                  className={`${styles['apply-button']} ${styles['apply-button-rejected']}`}
                                >
                                  🔄 재신청하기
                                </button>
                              );
                            }
                            
                            // 기본: 신청 가능 여부 체크
                            const displayInfo = getStudyDisplayInfo(
                              study.status,
                              study.deadline?.toISOString(),
                              study.startDate instanceof Date ? study.startDate.toISOString() : study.startDate,
                              study.endDate instanceof Date ? study.endDate.toISOString() : study.endDate,
                              study.capacity,
                              study.enrolled
                            );
                            
                            if (displayInfo.canApply) {
                              return (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/study/${study.slug}/apply`);
                                  }}
                                  className={styles['apply-button']}
                                >
                                  📝 참가 신청하기
                                </button>
                              );
                            }
                            
                            // 신청 불가능한 경우 null 반환
                            return null;
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </section>

              {/* 결제 테스트 UI는 /checkout/test 페이지로 통합되었습니다. */}
            </>
          ) : (
            <StudyCalendar studies={studies} />
          )}
          </div>
        </main>
      </div>
    );
};

export default StudyPage;
