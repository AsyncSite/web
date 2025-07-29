import { useEffect, useRef } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export const useScrollAnimation = (
  className: string = 'animate-in',
  options: ScrollAnimationOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      threshold = 0.1,
      rootMargin = '0px 0px -50px 0px',
      triggerOnce = true,
      delay = 0
    } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add(className);
            }, delay);
            
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove(className);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [className, options]);

  return elementRef;
};

// 여러 요소를 순차적으로 애니메이션하는 훅
export const useStaggeredAnimation = (
  itemsCount: number,
  staggerDelay: number = 100,
  className: string = 'animate-in'
) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = Array.from(entry.target.children);
            
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add(className);
              }, index * staggerDelay);
            });
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [itemsCount, staggerDelay, className]);

  return containerRef;
};

// 숫자 카운트 애니메이션 훅
export const useCountAnimation = (
  endValue: number,
  duration: number = 2000,
  startOnVisible: boolean = true
) => {
  const elementRef = useRef<HTMLElement>(null);
  const countRef = useRef<number>(0);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    
    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic 이징 함수
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      countRef.current = Math.floor(startValue + (endValue - startValue) * easedProgress);
      
      if (elementRef.current) {
        elementRef.current.textContent = countRef.current.toString();
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !startOnVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [endValue, duration, startOnVisible]);

  return { elementRef, animateCount };
};

// 스크롤 진행률 기반 애니메이션 훅
export const useScrollProgress = (callback: (progress: number) => void) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 요소가 화면에 들어오기 시작할 때부터 완전히 나갈 때까지의 진행률
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      let progress = 0;
      
      if (elementTop <= windowHeight && elementTop + elementHeight >= 0) {
        if (elementTop <= 0) {
          // 요소가 화면 위쪽으로 스크롤된 경우
          progress = Math.min(Math.abs(elementTop) / elementHeight, 1);
        } else {
          // 요소가 화면에 들어오는 경우
          progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        }
      }
      
      callback(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback]);

  return elementRef;
};

// 플로팅 카드 애니메이션 훅
export const useFloatingCardAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.floating-card');
            
            // 카드들을 순차적으로 나타나게 함
            cards.forEach((card, index) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0px)';
                
                // 지속적인 플로팅 애니메이션 시작
                startFloatingAnimation(card as HTMLElement, index);
              }, index * 200);
            });
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const startFloatingAnimation = (card: HTMLElement, index: number) => {
    const animateFloat = () => {
      const randomY = -20 + Math.random() * 10; // -20px to -10px
      const randomRotation = -2 + Math.random() * 4; // -2deg to 2deg
      const duration = 3000 + Math.random() * 2000; // 3s to 5s
      const delay = index * 500; // stagger delay
      
      card.animate([
        {
          transform: `translateY(0px) rotate(0deg)`,
          offset: 0
        },
        {
          transform: `translateY(${randomY}px) rotate(${randomRotation}deg)`,
          offset: 0.5
        },
        {
          transform: `translateY(0px) rotate(0deg)`,
          offset: 1
        }
      ], {
        duration: duration,
        delay: delay,
        easing: 'ease-in-out',
        iterations: Infinity
      });
    };

    // 처음 애니메이션 시작
    setTimeout(animateFloat, 500);
  };

  return containerRef;
};
