import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STUDY_LIST, getStudyUrl } from '../../constants/studies';
import './Header.css';

interface HeaderProps {
  transparent?: boolean;
  alwaysFixed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false, alwaysFixed = false }) => {
  const [isFixedTop, setIsFixedTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStudyDropdown, setShowStudyDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const studyDropdownRef = useRef<HTMLLIElement | null>(null);
  const studyDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [headerHeight, setHeaderHeight] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  
  // 모바일 여부 감지
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 모바일 메뉴가 열렸을 때 body 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isMobile]);

  useEffect(() => {
    // Header의 높이를 측정
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    // 투명 헤더인 경우 스크롤 감지
    if (transparent) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // 기존 Intro 섹션 관찰 로직
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
            // 헤더 위치가 변경될 때 열려있는 드롭다운 닫기
            setShowStudyDropdown(false);
            setShowUserMenu(false);
          } else {
            setIsFixedTop(false);
            // 헤더 위치가 변경될 때 열려있는 드롭다운 닫기
            setShowStudyDropdown(false);
            setShowUserMenu(false);
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
  }, [transparent, headerHeight]);

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (studyDropdownRef.current && !studyDropdownRef.current.contains(event.target as Node)) {
        setShowStudyDropdown(false);
      }
    };

    if (showUserMenu || showStudyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showStudyDropdown]);
  
  // 드롭다운 hover 핸들러 (데스크톱 전용)
  const handleStudyMouseEnter = () => {
    if (!isMobile) {
      if (studyDropdownTimeoutRef.current) {
        clearTimeout(studyDropdownTimeoutRef.current);
      }
      studyDropdownTimeoutRef.current = setTimeout(() => {
        setShowStudyDropdown(true);
      }, 300); // 300ms 딜레이로 실수 방지
    }
  };
  
  const handleStudyMouseLeave = () => {
    if (!isMobile) {
      if (studyDropdownTimeoutRef.current) {
        clearTimeout(studyDropdownTimeoutRef.current);
      }
      studyDropdownTimeoutRef.current = setTimeout(() => {
        setShowStudyDropdown(false);
      }, 300);
    }
  };
  
  // 드롭다운 click 핸들러 (모바일 또는 키보드)
  const handleStudyClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isMobile || e.type === 'keydown') {
      e.preventDefault();
      setShowStudyDropdown(!showStudyDropdown);
    }
  };
  
  // 키보드 이벤트 핸들러
  const handleStudyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStudyClick(e);
    } else if (e.key === 'Escape' && showStudyDropdown) {
      setShowStudyDropdown(false);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (studyDropdownTimeoutRef.current) {
        clearTimeout(studyDropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
    }
  };

  const headerClasses = [
    'header',
    (isFixedTop || alwaysFixed) && 'fixed-top',
    transparent && 'transparent',
    transparent && isScrolled && 'scrolled'
  ].filter(Boolean).join(' ');

  return (
    <header
      ref={headerRef}
      className={headerClasses}
    >
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>AsyncSite</Link>
          
          {/* 모바일 메뉴 토글 버튼 */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 열기"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
          <div className={`nav-right ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-menu">
              <li 
                className="has-dropdown"
                ref={studyDropdownRef}
                onMouseEnter={handleStudyMouseEnter}
                onMouseLeave={handleStudyMouseLeave}
              >
                <button 
                  className={`nav-link ${location.pathname.startsWith('/study') ? 'active' : ''}`}
                  onClick={(e) => {
                    if (!isMobile && !showStudyDropdown) {
                      navigate('/study');
                    } else {
                      handleStudyClick(e);
                    }
                  }}
                  onKeyDown={handleStudyKeyDown}
                  aria-haspopup="true"
                  aria-expanded={showStudyDropdown}
                >
                  STUDY
                  <svg 
                    className={`dropdown-arrow ${showStudyDropdown ? 'open' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showStudyDropdown && (
                  <div className="nav-dropdown">
                    {STUDY_LIST.filter(study => study.status !== 'closed').map(study => (
                      <Link 
                        key={study.id} 
                        to={getStudyUrl(study)} 
                        className="nav-dropdown-item"
                        onClick={() => {
                          setShowStudyDropdown(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span className="dropdown-item-name">{study.name}</span>
                        <span className={`dropdown-item-badge ${study.status}`}>
                          {study.status === 'recruiting' ? '모집중' : '진행중'}
                        </span>
                      </Link>
                    ))}
                    <div className="nav-dropdown-divider"></div>
                    <Link 
                      to="/study" 
                      className="nav-dropdown-item nav-dropdown-all"
                      onClick={() => {
                        setShowStudyDropdown(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      모든 스터디 보기 →
                    </Link>
                  </div>
                )}
              </li>
              <li>
                <Link 
                  to="/lab" 
                  className={location.pathname.startsWith('/lab') ? 'active' : ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LAB
                </Link>
              </li>
            </ul>
            <div className="auth-section">
            {isLoading ? (
              // 로딩 중일 때는 스켈레톤 또는 빈 공간 표시
              <div className="auth-loading">
                <div className="auth-skeleton"></div>
              </div>
            ) : (
              <>
                {isAuthenticated ? (
                  <div className="user-menu-container" ref={userMenuRef}>
                    <button 
                      className="user-menu-toggle"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      aria-expanded={showUserMenu}
                      aria-haspopup="true"
                    >
                      <span className="user-name">{user?.name || user?.username || user?.email}</span>
                      <svg 
                        className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {showUserMenu && (
                      <div className="user-menu-dropdown">
                        <a href="/users/me" className="user-menu-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          프로필
                        </a>
                        <a href="/users/me/edit" className="user-menu-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 1V6M12 18V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H6M18 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          설정
                        </a>
                        <div className="user-menu-divider"></div>
                        <button onClick={handleLogout} className="user-menu-item user-menu-logout">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="login-btn" onClick={handleAuthClick}>
                    JOIN US
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
