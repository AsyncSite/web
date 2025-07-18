import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isFixedTop, setIsFixedTop] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Header의 높이를 측정
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    // Intro 섹션 관찰
    const introSection = document.getElementById('intro');
    if (!introSection) {
      return;
    }

    // Intersection Observer 생성 - Intro 섹션의 하단 감지
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Intro 섹션이 거의 화면에서 벗어나면 헤더를 상단에 고정
          if (entry.intersectionRatio < 0.1) {
            setIsFixedTop(true);
          } else {
            setIsFixedTop(false);
          }
        });
      },
      {
        threshold: [0, 0.1],
        rootMargin: `-${headerHeight}px 0px 0px 0px`
      }
    );

    // Intro 섹션 관찰 시작
    observer.observe(introSection);

    return () => {
      observer.disconnect();
    };
  }, []);



  return (
    <header
      ref={headerRef}
      className={`header ${isFixedTop ? 'fixed-top' : ''}`}
    >
      <div className="container">
        <nav className="nav">
          <a href="/" className="logo">AsyncSite</a>
          <ul className="nav-menu">
            <li><a href="/study" className={location.pathname === '/study' ? 'active' : ''}>STUDY</a></li>
            <li><a href="/calendar" className={location.pathname === '/calendar' ? 'active' : ''}>CALENDAR</a></li>
            <li><a href="/lab" className={location.pathname === '/lab' ? 'active' : ''}>LAB</a></li>
            <li><a href="/study-plan" className={location.pathname === '/study-plan' ? 'active' : ''}>STUDY PLAN</a></li>
          </ul>
          <a className="login-btn">로그인/회원가입</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
