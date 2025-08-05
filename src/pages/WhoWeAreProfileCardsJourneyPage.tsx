import React, { useState, Suspense, lazy, useEffect, useRef } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';

// Lazy load Three.js scene
const ThreeSceneJourney = lazy(() => import('../components/whoweare/ThreeSceneJourney'));

// Import team members data from the original page
import { whoweareTeamMembers, WhoWeAreMemberData } from './WhoWeArePage';

const WhoWeAreProfileCardsJourneyPage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

  // Check WebGL support
  React.useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowPerformance = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
        
        if (!gl || isMobile || isLowPerformance) {
          setWhoweareShow3D(false);
          setWhoweareIsLoading(false);
        }
      } catch (e) {
        setWhoweareShow3D(false);
        setWhoweareIsLoading(false);
      }
    };

    checkWebGLSupport();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        const scrollHeight = scrollContainerRef.current.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const closeWhoWeareMemberPanel = () => {
    setWhoweareSelectedMember(null);
  };

  // Journey milestones
  const milestones = [
    { progress: 0, title: '여정의 시작', description: 'AsyncSite로 들어가는 첫 걸음' },
    { progress: 0.2, title: '깨달음', description: '흩어진 지식의 한계를 마주하다' },
    { progress: 0.4, title: '가치 발견', description: '함께 성장하는 힘을 찾다' },
    { progress: 0.6, title: '연결', description: '서로의 중력이 되어주는 사람들' },
    { progress: 0.8, title: '지속가능성', description: '오래갈 수 있는 시스템 구축' },
    { progress: 1, title: '우리의 공간', description: 'AsyncSite 팀을 만나보세요' }
  ];

  return (
    <div className="whoweare-planets-random-container">
      {/* Fixed 3D Scene */}
      {whoweareShow3D && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
          <Suspense fallback={null}>
            <ThreeSceneJourney
              members={whoweareTeamMembers}
              onMemberSelect={setWhoweareSelectedMember}
              onLoadComplete={() => setWhoweareIsLoading(false)}
              onLoadError={(error) => {
                setWhoweareLoadError(error);
                setWhoweareShow3D(false);
                setWhoweareIsLoading(false);
              }}
              scrollProgress={scrollProgress}
            />
          </Suspense>
        </div>
      )}

      {/* Loading screen */}
      {whoweareIsLoading && (
        <div className="whoweare-loading">
          <div className="whoweare-loading-text">PREPARING JOURNEY...</div>
        </div>
      )}

      {/* Scrollable content container */}
      <div 
        ref={scrollContainerRef}
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 2
        }}
      >
        {/* Scroll spacer */}
        <div style={{ height: '500vh', position: 'relative' }}>
          {/* Journey milestones */}
          {milestones.map((milestone, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${milestone.progress * 100}%`,
                left: '50px',
                transform: 'translateY(-50%)',
                opacity: Math.abs(scrollProgress - milestone.progress) < 0.1 ? 1 : 0.3,
                transition: 'opacity 0.5s ease',
                pointerEvents: 'none'
              }}
            >
              <div style={{
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '20px 30px',
                borderRadius: '10px',
                border: '1px solid rgba(195, 232, 141, 0.3)',
                maxWidth: '300px'
              }}>
                <h3 style={{
                  color: '#C3E88D',
                  fontSize: '1.3rem',
                  margin: '0 0 10px 0'
                }}>
                  {milestone.title}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}

          {/* Progress indicator */}
          <div style={{
            position: 'fixed',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '200px',
            width: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            zIndex: 100
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${scrollProgress * 100}%`,
              background: '#C3E88D',
              borderRadius: '2px',
              transition: 'height 0.1s ease'
            }} />
            
            {/* Progress dots */}
            {milestones.map((milestone, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: `${milestone.progress * 100}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: scrollProgress >= milestone.progress ? '#C3E88D' : 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid #000',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Scroll hint */}
          {scrollProgress < 0.05 && (
            <div style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              animation: 'bounce 2s infinite',
              zIndex: 100
            }}>
              <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                marginBottom: '10px'
              }}>
                스크롤하여 여정 시작
              </div>
              <div style={{
                width: '30px',
                height: '50px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  width: '4px',
                  height: '10px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '2px',
                  position: 'absolute',
                  top: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  animation: 'scrollDot 1.5s infinite'
                }} />
              </div>
            </div>
          )}

          {/* CTA at the end */}
          {scrollProgress > 0.9 && (
            <div style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: (scrollProgress - 0.9) * 10,
              transition: 'opacity 0.5s ease',
              zIndex: 100
            }}>
              <a href="/study" className="whoweare-cta-button">
                함께 성장하기 →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Member 2D Card */}
      <div className={`whoweare-member-card-container ${whoweareSelectedMember ? 'active' : ''}`}>
        {whoweareSelectedMember && (
          <div 
            className={`whoweare-member-card ${whoweareSelectedMember ? 'active' : ''}`}
            style={{ 
              '--member-color': whoweareSelectedMember.color, 
              '--member-dark-color': whoweareSelectedMember.darkColor || whoweareSelectedMember.color,
              '--member-color-rgb': hexToRgb(whoweareSelectedMember.color)
            } as React.CSSProperties}
          >
            <button className="whoweare-close-btn" onClick={closeWhoWeareMemberPanel}>×</button>
            
            <div className="whoweare-member-avatar">
              {whoweareSelectedMember.profileImage ? (
                <img src={whoweareSelectedMember.profileImage} alt={whoweareSelectedMember.name} />
              ) : (
                whoweareSelectedMember.initials
              )}
            </div>
            
            <div className="whoweare-member-name">{whoweareSelectedMember.name}</div>
            <div className="whoweare-member-role">{whoweareSelectedMember.role}</div>
            <div className="whoweare-member-quote">{whoweareSelectedMember.quote}</div>
            <div className="whoweare-member-story">{whoweareSelectedMember.story}</div>
            
            <div className="whoweare-member-links">
              <a href="#" className="whoweare-link-btn">G</a>
              <a href="#" className="whoweare-link-btn">B</a>
              <a href="#" className="whoweare-link-btn">L</a>
            </div>
            
            <div className="whoweare-card-cta">
              <a href="/study" className="whoweare-card-cta-link">
                함께 성장하기 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Version Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <a href="/whoweare-profile-cards" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          원본
        </a>
        <a href="/whoweare-profile-cards-floating" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          떠다니는 스토리
        </a>
        <a href="/whoweare-profile-cards-core" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          중앙 코어
        </a>
        <a href="/whoweare-profile-cards-sequence" 
           style={{
             padding: '8px 16px',
             background: 'rgba(0, 0, 0, 0.6)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             borderRadius: '20px',
             color: '#fff',
             textDecoration: 'none',
             fontSize: '0.9rem'
           }}>
          시퀀스
        </a>
        <span style={{
          padding: '8px 16px',
          background: 'rgba(195, 232, 141, 0.2)',
          border: '1px solid #C3E88D',
          borderRadius: '20px',
          color: '#C3E88D',
          fontSize: '0.9rem'
        }}>
          여행
        </span>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
        
        @keyframes scrollDot {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default WhoWeAreProfileCardsJourneyPage;