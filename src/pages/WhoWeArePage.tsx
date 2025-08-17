import React, { useState, Suspense, lazy, useEffect, useCallback } from 'react';
import './WhoWeArePage.css';
import './WhoWeAreProfileCardsPage.css';
import userService from '../api/userService';
import DOMPurify from 'dompurify';

// Lazy load Three.js scene
const ThreeScene = lazy(() => import('../components/whoweare/ThreeScene'));

// Import AI Guide components
import AIGuideDialogue from '../components/whoweare/onboarding/AIGuideDialogue';
import { aiGuideStore } from '../components/whoweare/onboarding/AIGuideStore';
import HelpButton from '../components/whoweare/onboarding/HelpButton';

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
  
  // Debug: Log whenever combinedTeamMembers changes
  useEffect(() => {
    console.log('[WhoWeArePage] combinedTeamMembers updated:', combinedTeamMembers.length, 'members');
    console.log('[WhoWeArePage] combinedTeamMembers details:', combinedTeamMembers);
  }, [combinedTeamMembers]);
  // New state for quality settings - doesn't affect existing desktop behavior
  const [renderQuality, setRenderQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  
  // AI Guide states
  const [showAIGuide, setShowAIGuide] = useState(true);
  const [currentDialogue, setCurrentDialogue] = useState('');


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

  // Quotes for admin users
  const adminQuotes = [
    '"기술로 더 나은 세상을 만들어갑니다"',
    '"함께 성장하는 커뮤니티를 만들어갑니다"',
    '"혁신적인 솔루션으로 문제를 해결합니다"',
    '"열정과 전문성으로 미래를 설계합니다"',
    '"지속 가능한 기술 생태계를 구축합니다"',
    '"창의적인 아이디어로 변화를 이끕니다"'
  ];

  // Map backend member to WhoWeAre member format
  const mapBackendMemberToWhoWeAre = (member: {
    name: string;
    role?: string;
    quote?: string;
    bio?: string;
    profileImage?: string;
  }, index: number): WhoWeAreMemberData => {
    const colorIndex = index % adminColors.length;
    const imageIndex = index % profileImages.length;
    const quoteIndex = index % adminQuotes.length;
    // Position members in a wider circle to avoid overlap with hardcoded members
    const angle = (Math.PI * 2 * index) / 8 + Math.PI / 4; // Offset angle to avoid collision
    const radius = 8; // Larger radius than hardcoded members
    
    return {
      id: `backend-member-${index}`,
      name: member.name,
      initials: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      role: member.role || 'AsyncSite Team',
      quote: member.quote ? `"${member.quote}"` : adminQuotes[quoteIndex],
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
        console.log('[WhoWeArePage] Fetching backend members...');
        const backendMembers = await userService.getWhoWeAreMembers();
        console.log('[WhoWeArePage] Backend members received:', backendMembers);
        
        if (backendMembers && backendMembers.length > 0) {
          console.log('[WhoWeArePage] Backend members count:', backendMembers.length);
          // Map backend members to WhoWeAre format
          const mappedBackendMembers = backendMembers.map((member, index) => 
            mapBackendMemberToWhoWeAre(member, index)
          );
          console.log('[WhoWeArePage] Mapped backend members:', mappedBackendMembers);
          
          // Combine hardcoded members with backend members
          const combined = [...whoweareTeamMembers, ...mappedBackendMembers];
          console.log('[WhoWeArePage] Combined members total:', combined.length);
          console.log('[WhoWeArePage] Combined members:', combined);
          setCombinedTeamMembers(combined);
          console.log('[WhoWeArePage] State updated with combined members');
        } else {
          console.log('[WhoWeArePage] No backend members or empty array');
        }
      } catch (error) {
        console.error('[WhoWeArePage] Error fetching members:', error);
        // If fetching fails, just use hardcoded members
        // Error is silently handled to prevent UI issues
      }
    };

    fetchWhoWeAreMembers();
  }, []);


  // Check WebGL support and device capabilities
  React.useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        // Device detection - improved logic
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const screenWidth = window.innerWidth;
        
        // Performance detection
        const cores = navigator.hardwareConcurrency || 2;
        const isLowPerformance = cores < 4;
        
        // Determine device type for new state (doesn't affect existing logic)
        if (!isMobile && !isTablet) {
          setDeviceType('desktop');
        } else if (isTablet || (isTouchDevice && screenWidth >= 768)) {
          setDeviceType('tablet');
        } else {
          setDeviceType('mobile');
        }
        
        // PRESERVED DESKTOP LOGIC - Desktop users see no change
        if (!isMobile && !isTablet) {
          // Desktop path - exactly as before
          if (!gl || isLowPerformance) {
            setWhoweareShow3D(false);
            setWhoweareIsLoading(false);
          }
          // Desktop keeps high quality by default
          setRenderQuality('high');
        } 
        // NEW MOBILE/TABLET LOGIC - Added without affecting desktop
        else {
          // Check if WebGL is supported
          if (!gl) {
            // No WebGL - disable 3D (safety fallback)
            setWhoweareShow3D(false);
            setWhoweareIsLoading(false);
          } else {
            // WebGL supported on mobile/tablet - enable with appropriate quality
            setWhoweareShow3D(true); // Enable 3D for capable mobile devices
            
            // Improved quality settings for better text readability
            // Consider both core count and screen resolution
            const highResScreen = window.devicePixelRatio >= 2;
            
            if (isTablet) {
              // Tablets generally have better performance
              if (cores >= 6) {
                setRenderQuality('high');
              } else if (cores >= 4) {
                setRenderQuality('medium');
              } else {
                setRenderQuality('low');
              }
            } else if (isMobile) {
              // Mobile quality based on cores and screen
              if (cores >= 8) {
                // High-end phones (flagship devices)
                setRenderQuality('high');
              } else if (cores >= 6 || (cores >= 4 && highResScreen)) {
                // Mid-to-high range phones
                setRenderQuality('medium');
              } else if (cores >= 4) {
                // Mid-range phones - prioritize text clarity
                setRenderQuality('low');
              } else if (cores >= 2) {
                // Low-end phones - still enable but with lowest quality
                setRenderQuality('low');
              } else {
                // Very low-end mobile - disable 3D
                setWhoweareShow3D(false);
                setWhoweareIsLoading(false);
              }
            } else {
              // Fallback
              setRenderQuality('low');
            }
          }
        }
      } catch (e) {
        // Error fallback - same as before
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

  // Handle story card selection with AI Guide interaction
  const handleStoryCardSelect = useCallback((storyData: any) => {
    setSelectedStoryCard(storyData);
    // Notify AI Guide about story card interaction
    if (showAIGuide) {
      aiGuideStore.recordInteraction('story', storyData?.id);
      const dialogue = aiGuideStore.getDialogueForAction('story');
      // Always set a dialogue, never empty string
      if (dialogue) {
        setCurrentDialogue(dialogue);
      } else {
        // Fallback message if dialogue is somehow empty
        setCurrentDialogue('카드를 자세히 살펴보고 있네요! 다른 카드들도 확인해보세요.');
      }
    }
  }, [showAIGuide]);
  
  // Handle member selection with AI Guide interaction
  const handleMemberSelect = useCallback((memberData: WhoWeAreMemberData | null) => {
    setWhoweareSelectedMember(memberData);
    // Notify AI Guide about member interaction
    if (showAIGuide && memberData) {
      aiGuideStore.recordInteraction('member', memberData.id);
      const dialogue = aiGuideStore.getDialogueForAction('member');
      // Always set a dialogue, never empty string  
      if (dialogue) {
        setCurrentDialogue(dialogue);
      } else {
        // Fallback message if dialogue is somehow empty
        setCurrentDialogue('팀원을 자세히 살펴보고 있네요! 다른 팀원들도 만나보세요.');
      }
    }
  }, [showAIGuide]);

  // Memoized callback for Three.js scene load complete
  const handleLoadComplete = useCallback(() => {
    setWhoweareIsLoading(false);
  }, []);
  
  // Initialize AI Guide on first mount only
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('whoweare-ai-guide-seen');
    if (!hasSeenGuide && !whoweareIsLoading) {
      setTimeout(() => {
        const dialogue = aiGuideStore.getDialogueForAction('intro');
        setCurrentDialogue(dialogue);
      }, 1000);
    } else if (hasSeenGuide) {
      setShowAIGuide(false);
    }
  }, [whoweareIsLoading]);

  // Memoized callback for Three.js scene load error
  const handleLoadError = useCallback((error: string) => {
    setWhoweareLoadError(error);
    setWhoweareShow3D(false);
    setWhoweareIsLoading(false);
  }, []);
  
  // AI Guide callbacks
  const handleAIGuideSkip = useCallback(() => {
    setShowAIGuide(false);
    aiGuideStore.skip();
    // Delay localStorage update to avoid triggering re-render
    setTimeout(() => {
      localStorage.setItem('whoweare-ai-guide-seen', 'true');
    }, 100);
  }, []);
  
  const handleAIGuideComplete = useCallback(() => {
    setShowAIGuide(false);
    aiGuideStore.complete();
    // Delay localStorage update to avoid triggering re-render
    setTimeout(() => {
      localStorage.setItem('whoweare-ai-guide-seen', 'true');
    }, 100);
  }, []);
  
  const handleAIGuideResponse = useCallback((response: string) => {
    // Handle user response to AI Guide
    const nextDialogue = aiGuideStore.processUserResponse(response);
    setCurrentDialogue(nextDialogue);
  }, []);
  
  const handleAIGuideBack = useCallback(() => {
    // Go back to previous dialogue
    const previousDialogue = aiGuideStore.goBack();
    if (previousDialogue) {
      setCurrentDialogue(previousDialogue);
    }
  }, []);
  
  const handleRestartAIGuide = useCallback(() => {
    // Reset only AI Guide state, not the scene
    aiGuideStore.reset();
    setShowAIGuide(true);
    // Delay dialogue start to avoid issues
    setTimeout(() => {
      const dialogue = aiGuideStore.getDialogueForAction('intro');
      setCurrentDialogue(dialogue);
      localStorage.removeItem('whoweare-ai-guide-seen');
    }, 100);
  }, []);

  return (
    <div className="whoweare-planets-random-container">
      {/* 3D Scene with AI Guide Character */}
      {whoweareShow3D && (
        <div className="whoweare-3d-container">
          <Suspense fallback={null}>
            <ThreeScene
              members={combinedTeamMembers}
              onMemberSelect={handleMemberSelect}
              onStoryCardSelect={handleStoryCardSelect}
              onLoadComplete={handleLoadComplete}
              onLoadError={handleLoadError}
              isUIActive={!!whoweareSelectedMember || !!selectedStoryCard || isClosingCard || isClosingMember}
              showAIGuide={showAIGuide}
              renderQuality={renderQuality}
              deviceType={deviceType}
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
            <div 
              className="whoweare-member-story"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(whoweareSelectedMember.story) 
              }}
            />
            
            <div className="whoweare-member-links">
              <a href="#" className="whoweare-link-btn">G</a>
              <a href="#" className="whoweare-link-btn">B</a>
              <a href="#" className="whoweare-link-btn">L</a>
            </div>
          </div>
        )}
      </div>
      
      {/* AI Guide Dialogue System */}
      {showAIGuide && !whoweareIsLoading && (
        <AIGuideDialogue
          dialogue={currentDialogue}
          onResponse={handleAIGuideResponse}
          onSkip={handleAIGuideSkip}
          onComplete={handleAIGuideComplete}
          onBack={handleAIGuideBack}
        />
      )}
      
      {/* Help Button */}
      <HelpButton 
        onHelp={handleRestartAIGuide}
        isVisible={!whoweareIsLoading && !showAIGuide}
      />

    </div>
  );
};

export default WhoWeArePage;