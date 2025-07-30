import React, { useState, useEffect } from 'react';
import './About.css';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface AboutSection {
  id: number;
  layout: 'question-left' | 'answer-left';
  questionNumber: string;
  questionTitle: string;
  questionIcon: string;
  answerTitle: string;
  answerText: string | React.ReactNode;
  features?: {
    icon: string;
    text: string;
  }[];
  highlights?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

const About: React.FC = () => {
  // Flip 애니메이션을 위한 텍스트 배열
  const flipTexts = [
    "개발자의 금요일 저녁이",
    "1년차 루나의 토요일 아침이",
    "취준생 아로의 일요일 오후가",
    "5년차 팀장 노바의 목요일 밤이",
    "이직 준비생 리오의 화요일 새벽이"
  ];
  
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [nextTextIndex, setNextTextIndex] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentTextIndex(nextTextIndex);
        setNextTextIndex((nextTextIndex + 1) % flipTexts.length);
        setIsFlipping(false);
      }, 800); // 애니메이션 완료 시점
    }, 4000); // 4초마다 텍스트 변경
    
    return () => clearInterval(interval);
  }, [nextTextIndex, flipTexts.length]);
  
  // About 섹션 데이터 - 따뜻한 서사 구조로 재구성
  const aboutSections: AboutSection[] = [
    {
      id: 1,
      layout: 'question-left',
      questionNumber: '01',
      questionTitle: 'Async Site는\n어떤 고민에서 시작했나요?',
      questionIcon: '💭',
      answerTitle: '혼자 공부하다 포기한 적 없으세요?',
      answerText: (
        <>
          유튜브 재생목록엔 '나중에 볼 영상' 300개,<br />
          깃허브 잔디는 듬성듬성,<br />
          시작은 거창했지만 흐지부지된 사이드 프로젝트들.<br />
          <br />
          우리 모두 겪어본 이야기입니다.<br />
          Async Site는 여기서 시작했어요.
        </>
      ),
      features: [
        { icon: '🤝', text: '함께하니까 꾸준해져요' },
        { icon: '📅', text: '매주 금요일이 기다려져요' },
        { icon: '🔥', text: '작심삼일이 작심삼년으로' }
      ]
    },
    {
      id: 2,
      layout: 'answer-left',
      questionNumber: '02',
      questionTitle: '검증된 리더와 체계적인 스터디는 어떻게 다른가요?',
      questionIcon: '🌟',
      answerTitle: '진짜 동료를 만나는 경험을 제공합니다',
      answerText: '매 시즌 엄선된 리더가 이끄는 스터디는 체계적이고 지속가능합니다. 코드 리뷰와 피드백을 통해 실력을 쌓고, 시즌제 운영으로 꾸준함을 만들어가며, 진짜 동료를 만나는 경험을 제공합니다.',
      highlights: [
        { icon: '👥', title: '코드 리뷰로 연결', description: '형식적인 만남이 아닌 코드로 대화하는 진짜 네트워킹' },
        { icon: '📅', title: '시즌제로 꾸준함', description: '일회성이 아닌 지속가능한 성장 시스템' },
        { icon: '✨', title: '검증된 리더십', description: '매 시즌 엄선된 리더가 이끄는 체계적인 스터디' }
      ]
    },
    {
      id: 3,
      layout: 'question-left',
      questionNumber: '03',
      questionTitle: '왜 좋은 동료와 함께하면 다를까요?',
      questionIcon: '🤝',
      answerTitle: '혼자서는 넘기 힘든 성장의 벽을 함께 넘어서요',
      answerText: '좋은 동료와 함께라면 어떤 변화도 두렵지 않다고 믿어요. 서로의 경험을 나누고, 다른 관점에서 배우며, 함께 성장하는 과정에서 혼자서는 얻을 수 없는 통찰력을 얻게 됩니다.',
      features: [
        { icon: '🎯', text: '공동의 목표 달성' },
        { icon: '💪', text: '상호 동기부여' },
        { icon: '🌈', text: '다양한 관점에서 배움' }
      ]
    }
  ];

  return (
    <section className="about section-background" id="about">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <div className={`flip-text-container ${isFlipping ? 'flipping' : ''}`}>
              <div className="flip-card">
                <div className="flip-card-face flip-card-current">
                  <span className="flip-text">{flipTexts[currentTextIndex]}</span>
                </div>
                <div className="flip-card-face flip-card-next">
                  <span className="flip-text">{flipTexts[nextTextIndex]}</span>
                </div>
              </div>
            </div>
            <br />
            특별해지는 이유
          </h2>
          <p className="section-subtitle">끝없이 쏟아지는 새로운 기술들, AI가 코드를 대신 짜주는 시대.<br />
          우리는 무엇을 추구해야 할까요?</p>
        </div>

        <main className="about-container">
          {aboutSections.map((section) => {
            const questionBlockRef = useScrollAnimation('animate-in', { 
              threshold: 0.4,
              rootMargin: '0px 0px -50px 0px',
              triggerOnce: false
            });
            
            const answerBlockRef = useScrollAnimation('animate-in', { 
              threshold: 0.4,
              rootMargin: '0px 0px -50px 0px',
              delay: 200,
              triggerOnce: false
            });
            
            return (
            <section key={section.id} className="about-subsection" data-layout={section.layout}>
              <div className="section-inner">
                <div className="question-block" ref={questionBlockRef}>
                  <div className="question-number">{section.questionNumber}</div>
                  <h2 className="question-title">{section.questionTitle}</h2>
                  <div className="question-visual">
                    <div className="visual-icon">{section.questionIcon}</div>
                    <div className="visual-decoration"></div>
                  </div>
                </div>
                <div className="answer-block" ref={answerBlockRef}>
                  <h3 className="answer-title">{section.answerTitle}</h3>
                  <div className="answer-text">{section.answerText}</div>
                  
                  {section.features && (
                    <div className="answer-features">
                      {section.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <span className="feature-icon">{feature.icon}</span>
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {section.highlights && (
                    <div className="culture-highlights">
                      {section.highlights.map((highlight, index) => (
                        <div key={index} className="highlight-item">
                          <div className="highlight-icon">{highlight.icon}</div>
                          <div className="highlight-text">
                            <h4>{highlight.title}</h4>
                            <p>{highlight.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
            );
          })}
        </main>
      </div>
    </section>
  );
};

export default About;