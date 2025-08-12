import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TemplateHeader } from '../layout';
import { Footer } from '../layout';
import LoadingSpinner from '../common/LoadingSpinner';
import studyDetailPageService, { StudyDetailPageData, PageSection, SectionType } from '../../api/studyDetailPageService';
import { SectionRenderer } from './sections';
import { RichTextConverter } from '../common/richtext/RichTextConverter';
import { restoreSectionTypes } from './utils/sectionTypeAdapter';
import { normalizeMembersPropsForUI } from './utils/membersAdapter';
import { blocksToHTML } from './utils/RichTextHelpers';
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
        backgroundColor: section.props.backgroundColor,
        theme: section.props.theme
      };
    
    case SectionType.FAQ:
      // API returns 'questions' but component expects 'items'
      // Pass all props including theme, tagHeader, showIcons for TecoTeco style
      // Also pass Join CTA props for TecoTeco theme
      return {
        items: section.props.questions || section.props.items || [],
        title: section.props.title,
        theme: section.props.theme,
        tagHeader: section.props.tagHeader,
        showIcons: section.props.showIcons,
        showJoinCTA: section.props.showJoinCTA,
        joinTitle: section.props.joinTitle,
        joinDescription: section.props.joinDescription,
        joinButtonText: section.props.joinButtonText,
        joinButtonAction: section.props.joinButtonAction
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
    case 'HOW_WE_ROLL':
      // HOW_WE_ROLL section props are already in the correct format
      return section.props;
    
    case SectionType.MEMBERS:
    case 'MEMBERS':
      // MEMBERS 섹션 props 매핑
      const membersProps = { ...section.props };
      
      // TecoTeco 페이지는 항상 tecoteco 테마 사용
      if (pageData && pageData.slug === 'tecoteco') {
        membersProps.theme = 'tecoteco';
        
        // weeklyMvp 설정 (배지에서 추출)
        if (!membersProps.weeklyMvp && membersProps.members) {
          const mvpMember = membersProps.members.find((m: any) => 
            m.badges?.some((b: any) => b.type === 'mvp')
          );
          if (mvpMember) {
            membersProps.weeklyMvp = mvpMember.name;
          }
        }
        
        // popularAlgorithms 배열 변환
        if (membersProps.stats && typeof membersProps.stats.popularAlgorithms === 'string') {
          membersProps.stats.popularAlgorithms = membersProps.stats.popularAlgorithms
            .split(',')
            .map((s: string) => s.trim());
        }
      }
      
      return membersProps;
    
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
        // 받은 데이터의 섹션 타입을 복원
        if (data && data.sections) {
          data.sections = restoreSectionTypes(data.sections);
        }
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
                  data={mapSectionPropsToComponentData(section, pageData)}
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