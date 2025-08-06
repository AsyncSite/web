import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';
import userService from '../api/userService';

// Lazy load Three.js scene
const ThreeSceneFloatingStory = lazy(() => import('../components/whoweare/ThreeSceneFloatingStory'));

// Import team members data
import { whoweareTeamMembers, WhoWeAreMemberData } from '../data/whoweareTeamMembers';

const WhoWeArePage: React.FC = () => {
  const [whoweareSelectedMember, setWhoweareSelectedMember] = useState<WhoWeAreMemberData | null>(null);
  const [whoweareIsLoading, setWhoweareIsLoading] = useState(true);
  const [whoweareLoadError, setWhoweareLoadError] = useState<string | null>(null);
  const [whoweareShow3D, setWhoweareShow3D] = useState(true);
  const [selectedStoryCard, setSelectedStoryCard] = useState<any>(null);
  const [isClosingCard, setIsClosingCard] = useState(false);
  const [isClosingMember, setIsClosingMember] = useState(false);
  const [combinedTeamMembers, setCombinedTeamMembers] = useState<WhoWeAreMemberData[]>(whoweareTeamMembers);


  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  };

  // Profile images to use for admin users (cycling through existing images)
  const profileImages = [
    '/images/face/rene.png',
    '/images/face/KrongDev.png',
    '/images/face/vvoohhee.png',
    '/images/face/kdelay.png'
  ];

  // Colors for admin users
  const adminColors = [
    { color: '#8b5cf6', darkColor: '#7c3aed' },
    { color: '#3b82f6', darkColor: '#2563eb' },
    { color: '#14b8a6', darkColor: '#0d9488' },
    { color: '#f97316', darkColor: '#ea580c' }
  ];

  // Map backend member to WhoWeAre member format
  const mapBackendMemberToWhoWeAre = (member: {
    name: string;
    role?: string;
    bio?: string;
    profileImage?: string;
  }, index: number): WhoWeAreMemberData => {
    const colorIndex = index % adminColors.length;
    const imageIndex = index % profileImages.length;
    // Position members in a wider circle to avoid overlap with hardcoded members
    const angle = (Math.PI * 2 * index) / 8 + Math.PI / 4; // Offset angle to avoid collision
    const radius = 8; // Larger radius than hardcoded members
    
    return {
      id: `backend-member-${index}`,
      name: member.name,
      initials: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      role: member.role || 'AsyncSite Team',
      quote: '"함께 성장하는 커뮤니티를 만들어갑니다"',
      story: member.bio || '열정적으로 AsyncSite를 운영하며 개발자들의 성장을 돕고 있습니다.',
      color: adminColors[colorIndex].color,
      darkColor: adminColors[colorIndex].darkColor,
      position: { 
        x: Math.cos(angle) * radius, 
        y: Math.sin(angle / 2) * 2, // Add more vertical variation
        z: Math.sin(angle) * radius 
      },
      profileImage: member.profileImage || profileImages[imageIndex]
    };
  };

  // Fetch admin users from backend
  useEffect(() => {
    const fetchWhoWeAreMembers = async () => {
      try {
        console.log('🔍 Fetching WhoWeAre members from backend...');
        const backendMembers = await userService.getWhoWeAreMembers();
        console.log('✅ Backend members fetched:', backendMembers);
        
        if (backendMembers && backendMembers.length > 0) {
          // Map backend members to WhoWeAre format
          const mappedBackendMembers = backendMembers.map((member, index) => 
            mapBackendMemberToWhoWeAre(member, index)
          );
          console.log('🗺️ Mapped backend members:', mappedBackendMembers);
          
          // Combine hardcoded members with backend members
          const combined = [...whoweareTeamMembers, ...mappedBackendMembers];
          console.log(`🌟 Combined team members: ${combined.length} total (${whoweareTeamMembers.length} hardcoded + ${mappedBackendMembers.length} backend)`);
          console.log('📋 All members:', combined.map(m => m.name));
          setCombinedTeamMembers(combined);
        } else {
          console.log('⚠️ No backend members found, using only hardcoded members');
        }
      } catch (error) {
        // If fetching fails, just use hardcoded members
        console.error('❌ Failed to fetch WhoWeAre members:', error);
      }
    };

    fetchWhoWeAreMembers();
  }, []);
  
  // Log when combinedTeamMembers changes
  useEffect(() => {
    console.log(`🎯 combinedTeamMembers updated: ${combinedTeamMembers.length} members`);
    console.log('📊 Member names:', combinedTeamMembers.map(m => m.name));
  }, [combinedTeamMembers]);


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

  const closeWhoWeareMemberPanel = () => {
    setIsClosingMember(true);
    setWhoweareSelectedMember(null);
    // Keep blocking clicks for a bit after closing (match story card timing)
    setTimeout(() => {
      setIsClosingMember(false);
    }, 200);
  };

  const closeStoryCard = () => {
    // Start closing animation
    setIsClosingCard(true);
    
    // Wait for fade out animation before triggering camera reset
    setTimeout(() => {
      const event = new CustomEvent('resetCamera');
      window.dispatchEvent(event);
      
      // Clear the card after camera starts moving
      setTimeout(() => {
        setSelectedStoryCard(null);
        setIsClosingCard(false);
      }, 50);
    }, 150); // Wait for fade out
  };

  // Handle story card selection
  const handleStoryCardSelect = useCallback((storyData: any) => {
    setSelectedStoryCard(storyData);
  }, []);

  // Memoized callback for Three.js scene load complete
  const handleLoadComplete = useCallback(() => {
    setWhoweareIsLoading(false);
  }, []);

  // Memoized callback for Three.js scene load error
  const handleLoadError = useCallback((error: string) => {
    setWhoweareLoadError(error);
    setWhoweareShow3D(false);
    setWhoweareIsLoading(false);
  }, []);

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene with Floating Story Panels */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeSceneFloatingStory
              members={combinedTeamMembers}
              onMemberSelect={setWhoweareSelectedMember}
              onStoryCardSelect={handleStoryCardSelect}
              onLoadComplete={handleLoadComplete}
              onLoadError={handleLoadError}
              isUIActive={!!whoweareSelectedMember || !!selectedStoryCard || isClosingCard || isClosingMember}
            />
          </Suspense>
        </div>
      )}

      {/* Fixed Header Text */}
      <div style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        color: '#ffffff',
        width: '90%',
        maxWidth: '1200px',
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          marginBottom: '12px',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(195, 232, 141, 0.3)',
          lineHeight: 1.5,
          fontWeight: 600,
          letterSpacing: '-0.02em'
        }}>
          AsyncSite는 성취하며 성장하는<br />백엔드 중심의 개발자 커뮤니티에요
        </h1>
        <p style={{
          fontSize: '1.2rem',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-0.01em'
        }}>
          각자의 궤도를 돌면서 서로의 중력이 되어주고 있어요
        </p>
      </div>


      {/* Loading screen */}
      {whoweareIsLoading && (
        <div className="whoweare-loading">
          <div className="whoweare-loading-text">ENTERING ASYNC UNIVERSE...</div>
        </div>
      )}

      {/* Navigation hint */}
      <div className="whoweare-instructions" style={{ left: '50%', transform: 'translateX(-50%)', right: 'auto' }}>
        <div className="whoweare-control-keys">
          <span className="whoweare-key">하나씩 클릭해보세요</span>
          <span className="whoweare-key">드래그로 회전이 가능해요</span>
        </div>
      </div>

      {/* Story 2D Card - Always rendered, controlled by CSS */}
      <div className={`whoweare-member-card-container ${selectedStoryCard ? 'active' : ''} ${isClosingCard ? 'closing' : ''}`} onClick={closeStoryCard}>
        <div 
          className={`whoweare-member-card ${selectedStoryCard ? 'active' : ''} ${isClosingCard ? 'closing' : ''}`}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            '--member-color': '#C3E88D', 
            '--member-dark-color': '#7CB342',
            '--member-color-rgb': '195, 232, 141',
            maxWidth: '600px',
            padding: '40px'
          } as React.CSSProperties}
        >
          <button className="whoweare-close-btn" onClick={closeStoryCard}>×</button>
          
          {selectedStoryCard?.title && (
            <h2 style={{
              color: '#C3E88D',
              fontSize: '2.5rem',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 700,
              whiteSpace: 'pre-line'
            }}>
              {selectedStoryCard.title}
            </h2>
          )}
          
          <div style={{
            fontSize: '1.3rem',
            lineHeight: '1.8',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            color: '#ffffff'
          }}>
            {selectedStoryCard?.content || ''}
          </div>
        </div>
      </div>

      {/* Member 2D Card */}
      <div className={`whoweare-member-card-container ${whoweareSelectedMember ? 'active' : ''}`} onClick={closeWhoWeareMemberPanel}>
        {whoweareSelectedMember && (
          <div 
            className={`whoweare-member-card ${whoweareSelectedMember ? 'active' : ''}`}
            onClick={(e) => e.stopPropagation()}
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
          </div>
        )}
      </div>

    </div>
  );
};

export default WhoWeArePage;