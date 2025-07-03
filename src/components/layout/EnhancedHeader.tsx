import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Calendar, FlaskRound as Flask, BarChart3, Waves } from 'lucide-react';
import './EnhancedHeader.css';

interface EnhancedHeaderProps {
  onSectionNavigate?: (sectionId: string) => void;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ onSectionNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // 부드러운 스크롤 함수
  const smoothScrollToTop = () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    }, 300);
  };

  // 현재 탭 클릭 감지 및 처리
  const handleTabClick = (targetPath: string, action: () => void) => {
    if (location.pathname === targetPath) {
      // 현재 페이지와 같은 탭 클릭 시 부드러운 스크롤
      smoothScrollToTop();
    } else {
      // 다른 페이지로 이동 - 약간의 지연으로 자연스럽게
      setTimeout(() => {
        action();
      }, 100);
    }
  };

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      action: () => handleTabClick('/', () => (isHomePage ? onSectionNavigate?.("intro") : navigate('/'))),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      action: () => handleTabClick('/calendar', () => navigate('/calendar')),
    },
    {
      id: "wave",
      label: "Wave",
      icon: Waves,
      action: () => handleTabClick('/wave', () => navigate('/wave'))
    },
    {
      id: "lab",
      label: "Lab",
      icon: Flask,
      action: () => handleTabClick('/lab', () => navigate('/lab'))
    },
    {
      id: "ranking",
      label: "Ranking",
      icon: BarChart3,
      action: () => handleTabClick('/ranking', () => navigate('/ranking'))
    },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    // 애니메이션 없이 스크롤 상단으로 순간이동
    window.scrollTo({ top: 0, behavior: 'auto' });
    item.action();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.nav-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <nav className="enhanced-header">
      <div className="enhanced-header-container">
        <div className="enhanced-header-content">
          {/* Logo */}
          <div
            className="enhanced-logo"
            onClick={() => handleNavigation(navigationItems[0])}
          >
            <img
              src={process.env.PUBLIC_URL + '/assets/IlilmanLogo.svg'}
              alt="Tecoteco Logo"
              className="logo-icon"
            />
            <span className="logo-text">Async Site</span>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className="nav-button"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="mobile-nav nav-menu">
            <div className="mobile-nav-content">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className="mobile-nav-button"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default EnhancedHeader;
