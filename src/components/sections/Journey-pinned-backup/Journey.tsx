import React, { useEffect, useRef } from 'react';
import './Journey.css';

// GSAP을 동적으로 로드
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

interface JourneyStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  testimonial: {
    content: string;
    author: string;
    studyName: string;
  };
}

interface ScrollTriggerCallbackVars {
  progress: number;
  direction: number;
  isActive: boolean;
}

const Journey: React.FC = () => {
  const journeySectionRef = useRef<HTMLDivElement>(null);
  const journeyPinnedRef = useRef<HTMLDivElement>(null);
  const journeyStageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const journeyTimelineRef = useRef<any>(null);
  const journeyGsapLoadedRef = useRef(false);

  const journeySteps: JourneyStep[] = [
    {
      id: 1,
      title: '발견',
      subtitle: '나와 맞는 스터디를 찾는 순간',
      description: '관심사와 목표가 비슷한 동료들과의 첫 만남',
      testimonial: {
        content: '처음엔 어떤 스터디가 맞을지 고민했는데, 상세한 소개를 보고 바로 결정했어요.',
        author: '김○○',
        studyName: '테코테코 2기'
      }
    },
    {
      id: 2,
      title: '연결',
      subtitle: '동료들과 코드로 대화하기 시작',
      description: '매주 만나 서로의 코드를 리뷰하고 더 나은 방법을 함께 고민하는 시간',
      testimonial: {
        content: '코드 리뷰를 통해 다른 관점을 배웠어요. 혼자서는 생각하지 못했던 방법들을 알게 됐죠.',
        author: '이○○',
        studyName: '11루틴 1기'
      }
    },
    {
      id: 3,
      title: '성장',
      subtitle: '피드백과 리뷰로 실력이 빛나는 순간',
      description: '수료증과 함께 남는 나만의 성장 포트폴리오',
      testimonial: {
        content: '3개월 전과 비교하면 정말 많이 성장했어요. 특히 코드 품질에 대한 시각이 달라졌습니다.',
        author: '박○○',
        studyName: 'DEVLOG-14 1기'
      }
    },
    {
      id: 4,
      title: '나눔',
      subtitle: '이제는 내가 다른 이들의 길잡이 별이 되어',
      description: '받은 것을 나누며 다음 시즌의 스터디 리더로',
      testimonial: {
        content: '리더가 되어 더 많이 배우게 됐어요. 가르치면서 제가 더 성장하는 것을 느낍니다.',
        author: '정○○',
        studyName: '알고리즘 마스터 리더'
      }
    }
  ];

  useEffect(() => {
    // GSAP 동적 로드
    const loadGSAP = async () => {
      if (journeyGsapLoadedRef.current) return;
      
      if (typeof window.gsap === 'undefined') {
        // GSAP 코어
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        gsapScript.async = true;
        document.head.appendChild(gsapScript);
        
        // ScrollTrigger 플러그인
        const scrollTriggerScript = document.createElement('script');
        scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
        scrollTriggerScript.async = true;
        
        await new Promise((resolve) => {
          gsapScript.onload = () => {
            document.head.appendChild(scrollTriggerScript);
            scrollTriggerScript.onload = resolve;
          };
        });
      }
      
      journeyGsapLoadedRef.current = true;
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      
      // 모션 선호도 확인
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      
      // Journey 섹션이 존재하는지 확인
      const journeyElement = journeySectionRef.current;
      const pinnedElement = journeyPinnedRef.current;
      if (!journeyElement || !pinnedElement) return;
      
      // GSAP 로드 완료 표시
      journeyElement.setAttribute('data-gsap-loaded', 'true');
      
      // 마스터 타임라인 생성
      const masterTimeline = gsap.timeline();
      journeyTimelineRef.current = masterTimeline;
      
      // 초기 상태 설정 - 첫 번째 스테이지만 보이도록
      journeyStageRefs.current.forEach((stage, index) => {
        if (stage) {
          const elements = {
            content: stage.querySelector('.journey-stage-content'),
            star: stage.querySelector('.journey-star'),
            starGlow: stage.querySelector('.journey-star-glow'),
            starPulse: stage.querySelector('.journey-star-pulse')
          };
          
          if (index === 0) {
            // 첫 번째 스테이지는 활성화
            gsap.set(elements.content, { opacity: 1, y: 0 });
            gsap.set(elements.star, { opacity: 1, scale: 1 });
            gsap.set([elements.starGlow, elements.starPulse], { opacity: 1 });
          } else {
            // 나머지 스테이지는 숨김
            gsap.set(elements.content, { opacity: 0, y: 50 });
            gsap.set(elements.star, { opacity: 0, scale: 0.8 });
            gsap.set([elements.starGlow, elements.starPulse], { opacity: 0 });
          }
        }
      });
      
      // 각 스테이지 전환 애니메이션을 타임라인에 추가
      journeySteps.forEach((step, index) => {
        if (index < journeySteps.length - 1) {
          const currentStage = journeyStageRefs.current[index];
          const nextStage = journeyStageRefs.current[index + 1];
          
          if (currentStage && nextStage) {
            // 현재 스테이지 요소들
            const currentElements = {
              content: currentStage.querySelector('.journey-stage-content'),
              star: currentStage.querySelector('.journey-star'),
              starGlow: currentStage.querySelector('.journey-star-glow'),
              starPulse: currentStage.querySelector('.journey-star-pulse')
            };
            
            // 다음 스테이지 요소들
            const nextElements = {
              content: nextStage.querySelector('.journey-stage-content'),
              star: nextStage.querySelector('.journey-star'),
              starGlow: nextStage.querySelector('.journey-star-glow'),
              starPulse: nextStage.querySelector('.journey-star-pulse')
            };
            
            // 전환 타이밍 계산
            const transitionPoint = (index + 1) / journeySteps.length;
            
            // 현재 스테이지 페이드아웃
            masterTimeline
              .to(currentElements.content, {
                opacity: 0,
                y: -50,
                duration: 0.5,
                ease: 'power2.in'
              }, transitionPoint)
              .to(currentElements.star, {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: 'power2.in'
              }, transitionPoint)
              .to([currentElements.starGlow, currentElements.starPulse], {
                opacity: 0,
                duration: 0.3
              }, transitionPoint)
              // 다음 스테이지 페이드인
              .to(nextElements.content, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
              }, transitionPoint + 0.1)
              .to(nextElements.star, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: 'power2.out'
              }, transitionPoint + 0.1)
              .to([nextElements.starGlow, nextElements.starPulse], {
                opacity: 1,
                duration: 0.3
              }, transitionPoint + 0.2);
          }
        }
      });
      
      // 진행 인디케이터 dots 가져오기
      const progressDots = journeyElement.querySelectorAll('.journey-dot');
      
      // ScrollTrigger 생성 - 섹션을 고정하고 타임라인을 스크롤에 연결
      ScrollTrigger.create({
        trigger: journeyElement,
        start: 'top top',
        end: '+=300%', // 4단계를 위해 300% 추가 스크롤
        scrub: 1,
        pin: pinnedElement, // 고정될 요소
        animation: masterTimeline,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: ScrollTriggerCallbackVars) => {
          // 현재 진행률에 따라 활성 dot 업데이트
          const progress = self.progress;
          const activeIndex = Math.min(
            Math.floor(progress * journeySteps.length),
            journeySteps.length - 1
          );
          
          progressDots.forEach((dot, index) => {
            if (index === activeIndex) {
              dot.classList.add(`journey-dot-${index + 1}`);
              (dot as HTMLElement).style.background = '#C3E88D';
              (dot as HTMLElement).style.borderColor = '#C3E88D';
              (dot as HTMLElement).style.boxShadow = '0 0 10px rgba(195, 232, 141, 0.5)';
            } else {
              dot.classList.remove(`journey-dot-${index + 1}`);
              (dot as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
              (dot as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.3)';
              (dot as HTMLElement).style.boxShadow = 'none';
            }
          });
        },
        // markers: true // 개발 시 디버깅용
      });
    };
    
    loadGSAP();
    
    // 클린업
    return () => {
      if (journeyTimelineRef.current) {
        journeyTimelineRef.current.kill();
      }
      // Journey 섹션과 관련된 ScrollTrigger만 제거
      if (window.ScrollTrigger && journeySectionRef.current) {
        const triggers = window.ScrollTrigger.getAll();
        triggers.forEach((trigger: any) => {
          if (journeySectionRef.current?.contains(trigger.trigger) || 
              trigger.trigger === journeySectionRef.current) {
            trigger.kill();
          }
        });
      }
    };
  }, [journeySteps.length]);

  return (
    <section 
      className="journey-scroll-section section-background" 
      id="journey" 
      ref={journeySectionRef}
    >
      <div className="journey-pinned-container" ref={journeyPinnedRef}>
        {/* 섹션 헤더 */}
        <div className="journey-fixed-header">
          <h2 className="journey-header-title">당신의 Async 여정</h2>
          <p className="journey-header-subtitle">함께 성장하는 여정의 네 가지 별</p>
        </div>
        
        {/* 스테이지 컨테이너 */}
        <div className="journey-stages-wrapper">
          {journeySteps.map((step, index) => (
            <div
              key={step.id}
              className={`journey-stage-item journey-stage-${step.id}`}
              ref={(el) => (journeyStageRefs.current[index] = el)}
            >
              {/* 별 요소 */}
              <div className="journey-star-container">
                <div className="journey-star-glow"></div>
                <div className="journey-star">
                  <span className="journey-star-number">{step.id}</span>
                </div>
                <div className="journey-star-pulse"></div>
              </div>
              
              {/* 콘텐츠 */}
              <div className="journey-stage-content">
                <h3 className="journey-stage-title">{step.title}</h3>
                <p className="journey-stage-subtitle">{step.subtitle}</p>
                <p className="journey-stage-description">{step.description}</p>
                
                <div className="journey-testimonial-box">
                  <p className="journey-testimonial-text">
                    "{step.testimonial.content}"
                  </p>
                  <p className="journey-testimonial-author">
                    - {step.testimonial.author}, {step.testimonial.studyName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 진행 인디케이터 */}
        <div className="journey-progress-dots">
          {journeySteps.map((step) => (
            <div key={step.id} className={`journey-dot journey-dot-${step.id}`}></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Journey;