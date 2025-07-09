import React, { useState, useEffect } from 'react';
import './BottomNavigation.css';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const BottomNavigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false); // 기본적으로 숨김
  const [bottomPosition, setBottomPosition] = useState<number>(20);

  const navItems: NavItem[] = [
    { id: 'intro', label: 'HOME', href: '#intro' },
    { id: 'about', label: 'ABOUT', href: '#about' },
    { id: 'roadmap', label: 'ROADMAP', href: '#roadmap' },
    { id: 'activities', label: 'ACTIVITIES', href: '#activities' },
    { id: 'studies', label: 'STUDIES', href: '#studies' },
    { id: 'flow', label: 'FLOW', href: '#flow' },
    { id: 'faq', label: 'FAQ', href: '#faq' },
    { id: 'recruit', label: 'RECRUIT', href: '#recruit' }
  ];

  useEffect(() => {
    // Intersection Observer로 히어로 섹션 감지
    const heroSection = document.getElementById('intro');
    const aboutSection = document.getElementById('about');

    if (heroSection && aboutSection) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target.id === 'intro') {
              // 히어로 섹션이 화면에서 사라지면 네비게이션 표시
              setIsVisible(!entry.isIntersecting);
              console.log('Hero visibility changed:', !entry.isIntersecting);
            }
          });
        },
        {
          threshold: 0.1, // 10%만 보여도 감지
          rootMargin: '0px 0px -90% 0px' // 하단 90% 마진으로 히어로가 거의 사라질 때 감지
        }
      );

      observer.observe(heroSection);

      return () => {
        observer.disconnect();
      };
    } else {
      console.log('Hero or About section not found');
    }
  }, []);

  // Footer 감지를 위한 Intersection Observer
  useEffect(() => {
    const footerSection = document.querySelector('.footer') as HTMLElement;

    if (footerSection) {
      const footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const footerRect = entry.boundingClientRect;
            const intersectionRatio = entry.intersectionRatio;

            if (entry.isIntersecting) {
              // Footer가 화면에 보이기 시작
              const footerTop = footerRect.top;
              const windowHeight = window.innerHeight;
              const navHeight = 80; // 네비게이션 높이
              const margin = 40; // 여유 간격

              // Footer 위에 확실히 위치시키기
              const distanceFromBottom = windowHeight - footerTop;
              const newPosition = distanceFromBottom + navHeight + margin;

              setBottomPosition(Math.max(20, newPosition));

              console.log('Footer visible - Observer:', {
                intersectionRatio,
                footerTop,
                windowHeight,
                distanceFromBottom,
                newPosition,
                'Footer가 화면에 들어온 높이': distanceFromBottom
              });
            } else {
              // Footer가 화면에서 사라짐
              setBottomPosition(20);
              console.log('Footer hidden - Observer');
            }
          });
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5], // 여러 단계로 감지
          rootMargin: '0px 0px 0px 0px'
        }
      );

      footerObserver.observe(footerSection);

      return () => {
        footerObserver.disconnect();
      };
    }
  }, []);

  // 활성 섹션 감지를 위한 스크롤 이벤트 (가벼운 로직만)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // 상단에서 200px 지점 기준
      const sections = navItems.map(item => document.getElementById(item.id));

      let currentSection = '';

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = navItems[i].id;
            break;
          }
        }
      }

      setActiveSection(currentSection);
      console.log('Active section:', currentSection, 'Scroll:', window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav
      className={`bottom-navigation ${isVisible ? 'visible' : 'hidden'}`}
      style={{ bottom: `${bottomPosition}px` }}
    >
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            data-section={item.id}
            onClick={() => handleNavClick(item.href)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
