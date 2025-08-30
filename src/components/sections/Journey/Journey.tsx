import React, { useEffect, useRef } from 'react';
import styles from './Journey.module.css';

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
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        studyName: '데브로그 1기'
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('active');
            }, index * 200);
          }
        });
      },
      { threshold: 0.5 }
    );

    starsRef.current.forEach((star) => {
      if (star) observer.observe(star);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.journey} id="journey">
      <div className="container" ref={containerRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>당신의 Async 여정</h2>
          <p className={styles.sectionSubtitle}>함께 성장하는 여정의 네 가지 별</p>
        </div>

        <div className={styles.journeyConstellation}>
          {/* SVG 별자리 연결선 */}
          <svg className={styles.constellationSvg} viewBox="0 0 1200 600">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C3E88D" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#82aaff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#C3E88D" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              className={styles.constellationPath}
              d="M150,150 Q300,50 450,150 T750,150 Q900,250 1050,150"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>

          {/* 별들과 내용 */}
          <div className={styles.journeySteps}>
            {journeySteps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.journeyStep} ${styles[`step${step.id}`]}`}
                ref={(el) => (starsRef.current[index] = el)}
              >
                <div className={styles.starContainer}>
                  <div className={styles.starGlow}></div>
                  <div className={styles.star}>
                    <span className={styles.starNumber}>{step.id}</span>
                  </div>
                  <div className={styles.starPulse}></div>
                </div>
                
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepSubtitle}>{step.subtitle}</p>
                  <p className={styles.stepDescription}>{step.description}</p>
                  
                  <div className={styles.stepTestimonial}>
                    <p className={styles.testimonialContent}>"{step.testimonial.content}"</p>
                    <p className={styles.testimonialAuthor}>
                      - {step.testimonial.author}, {step.testimonial.studyName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Journey;