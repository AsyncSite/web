import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Home, HelpCircle, HandHeart, Mail, Waves, Calendar } from 'lucide-react';
import './SectionNavigation.css';

interface SectionNavigationProps {
  onNavigate: (sectionId: string) => void;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const location = useLocation();

  // Only show on homepage
  const isHomepage = location.pathname === '/web' || location.pathname === '/';

  useEffect(() => {
    if (!isHomepage) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show navigation after scrolling past hero section
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 800);

      // Check if near bottom (footer area)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = scrollY + windowHeight;

      // If within 200px of bottom, consider it "at bottom"
      setIsAtBottom(documentHeight - scrollPosition < 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  if (!isHomepage || !isVisible) return null;

  const sections = [
    { id: 'about', label: 'About', icon: Users },
    { id: 'pre-wave', label: 'PRE-WAVE', icon: Waves },
    { id: 'calendar', label: 'Routine', icon: Calendar },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact-cta', label: 'Contact', icon: Mail },
  ];

  return (
    <div className={`section-navigation ${isAtBottom ? 'section-navigation-bottom' : ''}`}>
      <div className="section-nav-container">
        <div className="section-nav-content">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className="section-nav-button"
              title={section.label}
            >
              <section.icon className="w-4 h-4" />
              <span className="section-label">{section.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
