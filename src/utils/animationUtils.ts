// SOPT 스타일 애니메이션 유틸리티
export class AnimationController {
  private observers: IntersectionObserver[] = [];
  private animatedElements = new Set<Element>();

  // 1. 스크롤 트리거 애니메이션
  public initScrollAnimations() {
    // 기본 페이드인 애니메이션
    this.createScrollObserver('.animate-on-scroll', {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      animationClass: 'fade-in-up',
      delay: 0
    });

    // 스태거드 애니메이션 (카드들)
    this.createScrollObserver('.stagger-container', {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      animationClass: 'stagger-children',
      delay: 0
    });

    // 스케일 애니메이션
    this.createScrollObserver('.scale-on-scroll', {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
      animationClass: 'scale-in',
      delay: 100
    });

    // 슬라이드 애니메이션
    this.createScrollObserver('.slide-left', {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      animationClass: 'slide-in-left',
      delay: 0
    });

    this.createScrollObserver('.slide-right', {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      animationClass: 'slide-in-right',
      delay: 0
    });
  }

  // 2. 스태거드 엔트리 애니메이션
  private createScrollObserver(
    selector: string, 
    options: {
      threshold: number;
      rootMargin: string;
      animationClass: string;
      delay: number;
    }
  ) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animatedElements.add(entry.target);
          
          if (options.animationClass === 'stagger-children') {
            this.animateStaggeredChildren(entry.target as HTMLElement);
          } else {
            setTimeout(() => {
              entry.target.classList.add(options.animationClass);
            }, options.delay);
          }
        }
      });
    }, {
      threshold: options.threshold,
      rootMargin: options.rootMargin
    });

    elements.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  // 3. 스태거드 자식 요소 애니메이션
  private animateStaggeredChildren(container: HTMLElement) {
    const children = Array.from(container.children);
    const staggerDelay = 150; // 150ms 간격

    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('stagger-item-in');
      }, index * staggerDelay);
    });
  }

  // 4. CTA 버튼 강조 애니메이션
  public initCTAAnimations() {
    const ctaButtons = document.querySelectorAll('.cta-pulse');
    
    ctaButtons.forEach(button => {
      // 스크롤 시 펄스 효과
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pulse-animation');
            setTimeout(() => {
              entry.target.classList.remove('pulse-animation');
            }, 2000);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(button);
      this.observers.push(observer);
    });
  }

  // 5. 패럴랙스 효과
  public initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach((element) => {
        const rate = scrolled * -0.5;
        (element as HTMLElement).style.transform = `translateY(${rate}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // 6. 숫자 카운트 애니메이션
  public animateCounter(
    element: HTMLElement, 
    endValue: number, 
    duration: number = 2000,
    suffix: string = ''
  ) {
    const startValue = 0;
    const startTime = Date.now();
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic 이징
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
      
      element.textContent = currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  // 7. 호버 인터랙션 강화
  public initHoverEffects() {
    const hoverCards = document.querySelectorAll('.enhanced-hover');
    
    hoverCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover-active');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-active');
      });
    });
  }

  // 8. 섹션 전환 효과
  public initSectionTransitions() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-active');
        } else {
          entry.target.classList.remove('section-active');
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -20% 0px'
    });

    sections.forEach(section => observer.observe(section));
    this.observers.push(observer);
  }

  // 9. 모바일 최적화 체크
  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  // 10. 성능 최적화된 초기화
  public init() {
    // 모바일에서는 일부 애니메이션 제한
    if (this.isMobile()) {
      document.body.classList.add('mobile-optimized');
    }

    // Intersection Observer 지원 체크
    if ('IntersectionObserver' in window) {
      this.initScrollAnimations();
      this.initCTAAnimations();
      this.initSectionTransitions();
    }

    // requestAnimationFrame 지원 체크
    if ('requestAnimationFrame' in window) {
      this.initParallaxEffects();
    }

    this.initHoverEffects();
  }

  // 11. 정리 함수
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.animatedElements.clear();
  }
}

// 전역 애니메이션 컨트롤러 인스턴스
export const animationController = new AnimationController();

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    animationController.init();
  });
}
