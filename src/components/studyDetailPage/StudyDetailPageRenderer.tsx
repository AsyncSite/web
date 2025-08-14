import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TemplateHeader } from '../layout';
import { Footer } from '../layout';
import LoadingSpinner from '../common/LoadingSpinner';
import studyDetailPageService, { StudyDetailPageData, PageSection, SectionType } from '../../api/studyDetailPageService';
import studyService from '../../api/studyService';
import { SectionRenderer } from './sections';
import { ReviewSection } from '../review';
import MemberOnlySection from '../study/MemberOnlySection';
import { RichTextConverter } from '../common/richtext/RichTextConverter';
import { normalizeMembersPropsForUI } from './utils/membersAdapter';
import { blocksToHTML } from './utils/RichTextHelpers';
import { getStudyDisplayInfo } from '../../utils/studyStatusUtils';
import Modal from '../common/Modal/Modal';
import './StudyDetailPageRenderer.css';

/**
 * Maps API section props to component expected props structure
 * This adapter layer ensures components remain independent from API structure
 */
const mapSectionPropsToComponentData = (section: PageSection, pageData?: StudyDetailPageData | null): any => {
  switch (section.type) {
    case SectionType.RICH_TEXT:
      // Handle both block-based and HTML-based content
      let content = '';
      if (section.props.blocks && Array.isArray(section.props.blocks)) {
        // Convert blocks to HTML
        console.log('[StudyDetailPageRenderer] Converting blocks to HTML:', section.props.blocks);
        content = blocksToHTML(section.props.blocks);
        console.log('[StudyDetailPageRenderer] Converted HTML result:', content);
      } else {
        // Fallback to text or content property
        content = section.props.text || section.props.content || '';
      }
      
      return {
        content,
        title: section.props.title,
        alignment: section.props.alignment,
        padding: section.props.padding,
        maxWidth: section.props.maxWidth,
        backgroundColor: section.props.backgroundColor
      };
    
    case SectionType.FAQ:
      // API returns 'questions' but component expects 'items'
      // Pass all props including theme, tagHeader, showIcons for TecoTeco style
      // Also pass Join CTA props for TecoTeco theme
      return {
        items: section.props.questions || section.props.items || [],
        title: section.props.title,
        tagHeader: section.props.tagHeader,
        showIcons: section.props.showIcons,
        showJoinCTA: section.props.showJoinCTA,
        joinTitle: section.props.joinTitle,
        joinDescription: section.props.joinDescription,
        joinButtonText: section.props.joinButtonText,
        joinButtonAction: section.props.joinButtonAction
      };
    
    case SectionType.HERO:
      // HERO section props mapping with RichText conversion
      const heroData: any = {
        emoji: section.props.emoji,
        image: section.props.image || section.props.backgroundImage,
        ctaText: section.props.ctaText,
        ctaLink: section.props.ctaLink
      };
      
      // Title 변환: 문자열이면 RichText로 변환
      if (section.props.title) {
        heroData.title = typeof section.props.title === 'string' 
          ? RichTextConverter.fromHTML(section.props.title)
          : section.props.title;
      }
      
      // Subtitle 변환
      if (section.props.subtitle) {
        heroData.subtitle = typeof section.props.subtitle === 'string'
          ? RichTextConverter.fromHTML(section.props.subtitle)
          : section.props.subtitle;
      }
      
      // InfoBox items 변환
      if (section.props.infoBox) {
        heroData.infoBox = {
          header: section.props.infoBox.header,
          items: section.props.infoBox.items?.map((item: any) => ({
            icon: item.icon,
            text: typeof item.text === 'string'
              ? RichTextConverter.fromHTML(item.text)
              : item.text
          }))
        };
      }
      
      return heroData;
    
    case SectionType.HOW_WE_ROLL:
      // HOW_WE_ROLL section props are already in the correct format
      return section.props;
    
    case SectionType.JOURNEY:
      // JOURNEY section props are already in the correct format
      return section.props;
    
    case SectionType.EXPERIENCE:
      // EXPERIENCE section props are already in the correct format
      return section.props;
    
    case SectionType.MEMBERS:
      // MEMBERS 섹션 props 매핑
      const membersProps = { ...section.props };

      // 테마/슬러그 분기 없이 일관된 데이터 정규화 적용
      if (!membersProps.weeklyMvp && membersProps.members) {
        const mvpMember = membersProps.members.find((m: any) =>
          m.badges?.some((b: any) => b.type === 'mvp')
        );
        if (mvpMember) {
          membersProps.weeklyMvp = mvpMember.name;
        }
      }

      if (membersProps.stats && typeof membersProps.stats.popularAlgorithms === 'string') {
        membersProps.stats.popularAlgorithms = membersProps.stats.popularAlgorithms
          .split(',')
          .map((s: string) => s.trim());
      }

      return membersProps;
    
    default:
      // For other section types, pass props as is
      return section.props;
  }
};

const StudyDetailPageRenderer: React.FC = () => {
  const { studyIdentifier } = useParams<{ studyIdentifier: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [pageData, setPageData] = useState<StudyDetailPageData | null>(null);
  const [studyData, setStudyData] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  useEffect(() => {
    const fetchPageData = async () => {
      if (!studyIdentifier) {
        setError('스터디 식별자가 없습니다');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both page data and study data in parallel
        const [pageDataResult, studyDataResult] = await Promise.allSettled([
          studyDetailPageService.getPublishedPageBySlug(studyIdentifier),
          studyService.getStudyBySlug(studyIdentifier)
        ]);
        
        // Handle page data
        if (pageDataResult.status === 'fulfilled') {
          const data = pageDataResult.value;
          setPageData(data);
        } else {
          console.error('Failed to fetch study detail page:', pageDataResult.reason);
          if (pageDataResult.reason?.response?.status === 404) {
            setError('페이지를 찾을 수 없습니다');
          } else {
            setError('페이지를 불러오는 중 오류가 발생했습니다');
          }
        }
        
        // Handle study data
        if (studyDataResult.status === 'fulfilled') {
          setStudyData(studyDataResult.value);
        } else {
          console.error('Failed to fetch study data:', studyDataResult.reason);
          // Study data is optional, so we don't set error
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [studyIdentifier]);
  
  // Check membership and application status
  useEffect(() => {
    const checkMembershipAndApplication = async () => {
      // 인증 상태가 확정될 때까지 대기
      if (authLoading) return;
      // user 존재 여부만 체크 (isAuthenticated는 신뢰할 수 없음)
      if (!user || !studyData?.id) return;
      
      try {
        // 멤버십 확인
        const myStudies = await studyService.getMyMemberships();
        const isStudyMember = myStudies.some(study => study.studyId === studyData.id);
        setIsMember(isStudyMember);
        
        // 이미 멤버라면 신청 상태는 체크할 필요 없음
        if (isStudyMember) {
          setApplicationStatus('approved');
        } else {
          // 신청 상태 확인
          const myApplications = await studyService.getMyApplications();
          const application = myApplications.find(app => app.studyId === studyData.id);
          
          if (application) {
            setApplicationId(application.applicationId);
            // ApplicationStatus enum 값에 따라 상태 설정
            if (application.status === 'PENDING') {
              setApplicationStatus('pending');
            } else if (application.status === 'ACCEPTED') {
              setApplicationStatus('approved');
            } else if (application.status === 'REJECTED') {
              setApplicationStatus('rejected');
            }
          } else {
            setApplicationStatus('none');
          }
        }
      } catch (error) {
        console.error('Failed to check membership and application:', error);
      }
    };
    
    checkMembershipAndApplication();
  }, [user, studyData, authLoading]);
  
  // Sort sections by order - DB에 저장된 순서를 그대로 사용
  // 프론트엔드에서 임의로 정렬하지 않음 (Single Source of Truth)
  const sortedSections = pageData ? [...pageData.sections].sort((a, b) => {
    // null/undefined order는 0으로 처리
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  }) : [];
  
  if (loading) {
    return (
      <div className="study-detail-page-renderer">
        <TemplateHeader />
        <main className="study-detail-page-content">
          <div className="loading-container">
            <LoadingSpinner />
            <p>페이지를 불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // pageData가 없지만 studyData가 있으면 기본 스터디 페이지 표시
  if (!pageData && studyData) {
    return (
      <div className="study-detail-page-renderer">
        <TemplateHeader />
        <main className="study-detail-page-content">
          <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <h1>{studyData.name} {studyData.generation > 1 ? `${studyData.generation}기` : ''}</h1>
            <p>{studyData.tagline}</p>
            {studyData.description && <p>{studyData.description}</p>}
            
            <div style={{ marginTop: '40px' }}>
              <h2>스터디 정보</h2>
              <ul>
                {(studyData.schedule || studyData.duration) && (
                  <li>일정: {studyData.schedule} {studyData.duration}</li>
                )}
                {studyData.capacity > 0 && (
                  <li>정원: {studyData.capacity}명 (현재 {studyData.enrolled}명 참여)</li>
                )}
                <li>리더: {studyData.leader.name}</li>
                <li>상태: {getStudyDisplayInfo(studyData.status, studyData.deadline?.toISOString()).label}</li>
              </ul>
            </div>
            
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !pageData) {
    return (
      <div className="study-detail-page-renderer">
        <TemplateHeader />
        <main className="study-detail-page-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>페이지를 불러올 수 없습니다</h2>
            <p>{error || '알 수 없는 오류가 발생했습니다'}</p>
            <button 
              onClick={() => window.location.href = '/study'}
              className="back-button"
            >
              스터디 목록으로 돌아가기
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="study-detail-page-renderer">
      <TemplateHeader />
      <main className="study-detail-page-content">
        {sortedSections.length === 0 ? (
          <div className="empty-page-container">
            <div className="empty-icon">📄</div>
            <h2>아직 콘텐츠가 없습니다</h2>
            <p>이 페이지는 준비 중입니다</p>
          </div>
        ) : (
          <div className="sections-container">
            {/* Study Status Banner */}
            {studyData && (
              <div className={`study-status-banner status-${studyData.status?.toLowerCase()}`}>
                {studyData.status === 'APPROVED' && (
                  <>
                    <span className="status-icon">🚀</span>
                    <div className="status-info">
                      <h3>모집 중인 스터디입니다</h3>
                      <p>마감일: {studyData.recruitDeadline ? new Date(studyData.recruitDeadline).toLocaleDateString() : '미정'}</p>
                    </div>
                    {/* 상태별 버튼 표시 */}
                    {applicationStatus === 'none' && (
                      <button 
                        className="apply-button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // 로그인 상태 확인
                          if (!user || !isAuthenticated) {
                            console.log('로그인 필요: user=', user, 'isAuthenticated=', isAuthenticated);
                            setShowLoginModal(true);
                            return;
                          }
                          
                          // 로그인된 경우에만 이동
                          navigate(`/study/${studyData.id}/apply`);
                        }}
                      >
                        참가 신청하기
                      </button>
                    )}
                    {applicationStatus === 'pending' && (
                      <div className="application-status-container">
                        <button className="apply-button disabled" disabled>
                          심사 대기중
                        </button>
                        <button 
                          className="cancel-button"
                          onClick={async () => {
                            if (window.confirm('신청을 취소하시겠습니까?')) {
                              if (!applicationId) {
                                alert('신청 정보를 찾을 수 없습니다.');
                                return;
                              }
                              try {
                                const userIdentifier = user?.email || user?.username || '';
                                await studyService.cancelApplication(studyData.id, applicationId, userIdentifier);
                                setApplicationStatus('none');
                                setApplicationId(null);
                                window.location.reload();
                              } catch (err) {
                                console.error('Failed to cancel application:', err);
                                alert('신청 취소에 실패했습니다.');
                              }
                            }
                          }}
                        >
                          신청 취소
                        </button>
                      </div>
                    )}
                    {applicationStatus === 'approved' && isMember && (
                      <button className="apply-button approved" disabled>
                        ✅ 참여 중
                      </button>
                    )}
                    {applicationStatus === 'rejected' && (
                      <button 
                        className="apply-button rejected" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!user || !isAuthenticated) {
                            setShowLoginModal(true);
                            return;
                          }
                          
                          navigate(`/study/${studyData.id}/apply`);
                        }}
                      >
                        재신청하기
                      </button>
                    )}
                  </>
                )}
                {studyData.status === 'IN_PROGRESS' && (
                  <>
                    <span className="status-icon">📚</span>
                    <div className="status-info">
                      <h3>진행 중인 스터디입니다</h3>
                      <p>현재 활발히 진행되고 있습니다</p>
                    </div>
                  </>
                )}
                {studyData.status === 'COMPLETED' && (
                  <>
                    <span className="status-icon">✅</span>
                    <div className="status-info">
                      <h3>완료된 스터디입니다</h3>
                      <p>스터디가 성공적으로 종료되었습니다</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {sortedSections.map((section) => (
              <div key={section.id} className="section-wrapper">
                <SectionRenderer 
                  type={section.type} 
                  data={mapSectionPropsToComponentData(section, pageData)}
                  studyId={pageData.studyId}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인 필요"
        message="스터디 참가 신청을 위해서는 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
        type="info"
        confirmText="로그인"
        cancelText="취소"
        showCancel={true}
        onConfirm={() => {
          navigate('/login', { state: { from: `/study/${studyData?.id}/apply` } });
        }}
      />
    </div>
  );
};

export default StudyDetailPageRenderer;