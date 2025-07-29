import React, { useEffect, useState, useRef } from 'react';
import './ScrollNavigation.css';
import './NavigationLayout.css';

interface NavigationItem {
  id: string;
  label: string;
  section: string;
}

const ScrollNavigation: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<string>('intro');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRefs = useRef<Map<string, Element>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 네비게이션 메뉴 아이템들
  const navigationItems: NavigationItem[] = [
    { id: 'intro', label: '시작', section: 'intro' },
    { id: 'about', label: '소개', section: 'about' },
    { id: 'stats', label: '통계', section: 'stats' },
    { id: 'roadmap', label: '로드맵', section: 'roadmap' },
    { id: 'activities', label: '활동', section: 'activities' },
    { id: 'flow', label: '프로세스', section: 'flow' },
    { id: 'studies', label: '스터디', section: 'studies' },
    { id: 'faq', label: 'FAQ', section: 'faq' },
  ];

  useEffect(() => {
    // 모든 섹션을 찾아서 저장 (네비게이션에 없는 섹션도 포함)
    const allSectionIds = [...navigationItems.map(item => item.section), 'cta', 'contribution'];
    const sections = allSectionIds.map(sectionId => 
      document.getElementById(sectionId)
    ).filter(Boolean) as Element[];

    sections.forEach(section => {
      sectionRefs.current.set(section.id, section);
    });

    // Intersection Observer 설정
    const options = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.3
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setCurrentSection(sectionId);

          // About부터 FAQ까지만 네비게이션 표시
          if (sectionId !== 'intro' && sectionId !== 'cta' && sectionId !== 'contribution') {
            setIsVisible(true);
            // 데스크톱에서 메인 콘텐츠 레이아웃 조정
            updateMainContentLayout(true);
          } else {
            setIsVisible(false);
            updateMainContentLayout(false);
          }
        }
      });
    }, options);

    // 섹션들을 관찰 대상에 추가
    sections.forEach(section => {
      if (observerRef.current) {
        observerRef.current.observe(section);
      }
    });

    // 리사이즈 이벤트 핸들러
    const handleResize = () => {
      // 현재 상태에 따라 레이아웃 재조정
      if (isVisible) {
        updateMainContentLayout(true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  // 메인 콘텐츠 레이아웃 업데이트
  const updateMainContentLayout = (withNavigation: boolean) => {
    // 네비게이션이 표시되는 섹션만 대상으로 함 (intro, cta, contribution 제외)
    const targetSections = ['about', 'stats', 'roadmap', 'activities', 'flow', 'studies', 'faq'];
    
    targetSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        if (withNavigation && window.innerWidth > 1024) {
          section.classList.add('section-with-nav');
          section.classList.remove('section-full-width');
        } else {
          section.classList.remove('section-with-nav');
          section.classList.add('section-full-width');
        }
      }
    });
  };

  const handleSectionClick = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


  return (
    <div 
      className={`scroll-navigation ${isVisible ? 'visible' : ''}`}
    >
      {/* 네비게이션 메뉴 */}
      <nav className="nav-menu">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${currentSection === item.section ? 'active' : ''}`}
                onClick={() => handleSectionClick(item.section)}
                data-section={item.section}
                aria-label={`${item.label} 섹션으로 이동`}
              >
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ScrollNavigation;