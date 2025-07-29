import React, { useEffect, useRef } from 'react';
import './Journey.css';

// GSAP을 동적으로 로드
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

// ScrollTrigger 타입 정의
interface ScrollTriggerCallbackVars {
  progress: number;
  direction: number;
  isActive: boolean;
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

const Journey: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<any>(null);
  const scrollTriggerRef = useRef<any>(null);

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
      
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      
      // 모션 선호도 확인
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      
      // 마스터 타임라인 생성
      const tl = gsap.timeline();
      timelineRef.current = tl;
      
      // 각 스테이지 애니메이션 추가
      stagesRef.current.forEach((stage, index) => {
        if (!stage) return;
        
        // 스테이지 콘텐츠 페이드인
        const content = stage.querySelector('.journey-stage-content');
        const star = stage.querySelector('.journey-star');
        const path = stage.querySelector('.journey-path');
        
        // 각 스테이지에 ScrollTrigger 생성
        ScrollTrigger.create({
          trigger: stage,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
          onEnter: () => {
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power2.out'
            });
            gsap.to(star, {
              scale: 1.2,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          onLeaveBack: () => {
            gsap.to(content, {
              opacity: 0,
              y: 50,
              duration: 0.8
            });
            gsap.to(star, {
              scale: 0.8,
              opacity: 0.5,
              duration: 0.8
            });
          }
        });
        
        // 별자리 경로 그리기
        if (path && index > 0) {
          const svgPath = path as SVGPathElement;
          const pathLength = svgPath.getTotalLength();
          gsap.set(svgPath, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
          });
          
          ScrollTrigger.create({
            trigger: stage,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 1,
            onUpdate: (self: ScrollTriggerCallbackVars) => {
              gsap.to(svgPath, {
                strokeDashoffset: pathLength * (1 - self.progress),
                duration: 0
              });
            }
          });
        }
      });
      
      // 헤더 페이드아웃
      const header = sectionRef.current?.querySelector('.section-header');
      if (header) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '20% top',
          scrub: true,
          onUpdate: (self: ScrollTriggerCallbackVars) => {
            gsap.to(header, {
              opacity: 1 - self.progress,
              y: -50 * self.progress,
              duration: 0
            });
          }
        });
      }
    };
    
    loadGSAP();
    
    // 클린업
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  }, []);

  return (
    <section className="journey journey-cinematic" id="journey" ref={sectionRef}>
      {/* 초기 헤더 */}
      <div className="section-header">
        <h2 className="section-title">당신의 Async 여정</h2>
        <p className="section-subtitle">함께 성장하는 여정의 네 가지 별</p>
      </div>
      
      {/* 각 여정 단계 (풀스크린) */}
      {journeySteps.map((step, index) => (
        <div
          key={step.id}
          className="journey-stage"
          ref={(el) => (stagesRef.current[index] = el)}
        >
          {/* 별자리 SVG */}
          <svg className="journey-constellation-bg" viewBox="0 0 1920 1080">
            <defs>
              <radialGradient id={`starGradient${step.id}`}>
                <stop offset="0%" stopColor="#C3E88D" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C3E88D" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`pathGradient${step.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C3E88D" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#82aaff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C3E88D" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* 이전 별과의 연결선 */}
            {index > 0 && (
              <path
                className="journey-path"
                d={`M ${400 + (index - 1) * 300},540 Q ${550 + (index - 1) * 300},440 ${700 + (index - 1) * 300},540`}
                fill="none"
                stroke={`url(#pathGradient${step.id})`}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
            
            {/* 현재 별 */}
            <circle
              className="journey-star"
              cx={700 + index * 300}
              cy="540"
              r="60"
              fill="none"
              stroke="#C3E88D"
              strokeWidth="3"
            />
            <circle
              className="journey-star-inner"
              cx={700 + index * 300}
              cy="540"
              r="50"
              fill={`url(#starGradient${step.id})`}
            />
            <text
              x={700 + index * 300}
              y="550"
              textAnchor="middle"
              className="journey-star-number"
              fill="#C3E88D"
              fontSize="36"
              fontWeight="900"
            >
              {step.id}
            </text>
          </svg>
          
          {/* 콘텐츠 */}
          <div className="journey-stage-content">
            <h3 className="journey-stage-title">{step.title}</h3>
            <p className="journey-stage-subtitle">{step.subtitle}</p>
            <p className="journey-stage-description">{step.description}</p>
            
            <div className="journey-testimonial">
              <p className="journey-testimonial-content">
                "{step.testimonial.content}"
              </p>
              <p className="journey-testimonial-author">
                - {step.testimonial.author}, {step.testimonial.studyName}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* 마지막 CTA */}
      <div className="journey-stage journey-final">
        <div className="journey-stage-content">
          <p className="journey-cta-text">이제 당신의 여정을 시작할 차례입니다</p>
          <a href="#studies" className="journey-cta-button">지금 모집 중인 스터디 보기</a>
        </div>
      </div>
    </section>
  );
};

export default Journey;