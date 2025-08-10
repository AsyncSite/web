import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TemplateHeader } from '../layout';
import { Footer } from '../layout';
import LoadingSpinner from '../common/LoadingSpinner';
import studyDetailPageService, { StudyDetailPageData, PageSection, SectionType } from '../../api/studyDetailPageService';
import { SectionRenderer } from './sections';
import './StudyDetailPageRenderer.css';

/**
 * Maps API section props to component expected props structure
 * This adapter layer ensures components remain independent from API structure
 */
const mapSectionPropsToComponentData = (section: PageSection): any => {
  switch (section.type) {
    case SectionType.RICH_TEXT:
      // API returns 'text' but component expects 'content'
      return {
        content: section.props.text || section.props.content || '',
        alignment: section.props.alignment,
        padding: section.props.padding,
        maxWidth: section.props.maxWidth
      };
    
    case SectionType.FAQ:
      // API returns 'questions' but component expects 'items'
      return {
        items: section.props.questions || section.props.items || [],
        title: section.props.title
      };
    
    case SectionType.CTA:
      // Ensure all expected props are present
      return {
        title: section.props.title,
        subtitle: section.props.subtitle || '',
        buttonText: section.props.buttonText,
        buttonLink: section.props.buttonLink
      };
    
    case SectionType.HERO:
      // HERO section props mapping
      return {
        title: section.props.title,
        subtitle: section.props.subtitle,
        emoji: section.props.emoji,
        image: section.props.image || section.props.backgroundImage,
        infoBox: section.props.infoBox,
        ctaText: section.props.ctaText,
        ctaLink: section.props.ctaLink
      };
    
    default:
      // For other section types, pass props as is
      return section.props;
  }
};

const StudyDetailPageRenderer: React.FC = () => {
  const { studyIdentifier } = useParams<{ studyIdentifier: string }>();
  const [pageData, setPageData] = useState<StudyDetailPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        // Try to fetch published page by slug
        const data = await studyDetailPageService.getPublishedPageBySlug(studyIdentifier);
        setPageData(data);
      } catch (err: any) {
        console.error('Failed to fetch study detail page:', err);
        
        // If page not found or error, show error
        if (err.response?.status === 404) {
          setError('페이지를 찾을 수 없습니다');
        } else {
          setError('페이지를 불러오는 중 오류가 발생했습니다');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPageData();
  }, [studyIdentifier]);
  
  // Apply custom theme if available (removed - using site default theme)
  useEffect(() => {
    // Theme application removed - using Async Site default theme
    // The site already has a consistent dark theme defined in index.css
    return () => {
      // Cleanup if needed
    };
  }, []);
  
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
  
  // Sort sections by order
  // Hero 섹션을 항상 첫 번째로, 나머지는 order 순서대로
  const sortedSections = [...pageData.sections].sort((a, b) => {
    // Hero 섹션을 최우선으로
    if (a.type === 'HERO' && b.type !== 'HERO') return -1;
    if (a.type !== 'HERO' && b.type === 'HERO') return 1;
    
    // 그 다음 RICH_TEXT 중에서도 테스트 쓰레기 텍스트는 맨 뒤로
    const isTestContentA = a.type === 'RICH_TEXT' && 
      (a.props?.content?.includes('Welcome to Our Dynamic Study Page') || 
       a.props?.text?.includes('Welcome to Our Dynamic Study Page'));
    const isTestContentB = b.type === 'RICH_TEXT' && 
      (b.props?.content?.includes('Welcome to Our Dynamic Study Page') ||
       b.props?.text?.includes('Welcome to Our Dynamic Study Page'));
    
    if (isTestContentA && !isTestContentB) return 1;
    if (!isTestContentA && isTestContentB) return -1;
    
    // 나머지는 order 순서대로
    return a.order - b.order;
  });
  
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
            {sortedSections.map((section) => (
              <div key={section.id} className="section-wrapper">
                <SectionRenderer 
                  type={section.type} 
                  data={mapSectionPropsToComponentData(section)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudyDetailPageRenderer;