import React from 'react';
import './About.css';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface AboutSection {
  id: number;
  layout: 'question-left' | 'answer-left';
  questionNumber: string;
  questionTitle: string;
  questionIcon: string;
  answerTitle: string;
  answerText: string;
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
  
  // About 섹션 데이터 - SOPT 스타일 구조
  const aboutSections: AboutSection[] = [
    {
      id: 1,
      layout: 'question-left',
      questionNumber: '01',
      questionTitle: '왜 Async인가요?',
      questionIcon: '🎯',
      answerTitle: '개발자 중심의 자유로운 성장 공간',
      answerText: 'Async는 단순한 커뮤니티가 아닙니다. 개발자들이 자신만의 속도로 성장할 수 있는 공간을 제공하며, 함께하되 강요하지 않는 느슨한 연결을 지향합니다.',
      features: [
        { icon: '💻', text: '자유로운 개발 환경' },
        { icon: '🤝', text: '수평적 협업 문화' },
        { icon: '🌱', text: '개인 맞춤형 성장' }
      ]
    },
    {
      id: 2,
      layout: 'answer-left',
      questionNumber: '02',
      questionTitle: '어떤 방식으로 함께하나요?',
      questionIcon: '🌐',
      answerTitle: 'Non-blocking 방식의 유연한 참여',
      answerText: '각자의 일정과 상황에 맞춰 자유롭게 참여할 수 있습니다. 의무적인 참석보다는 진정한 관심과 열정을 바탕으로 한 자발적 참여를 중시합니다.',
      highlights: [
        { icon: '🎮', title: '게임처럼 즐거운 학습', description: '재미있는 방식으로 함께 성장' },
        { icon: '🔄', title: '유연한 참여 방식', description: '개인 일정에 맞춘 자유로운 활동' },
        { icon: '💡', title: '지식 공유 문화', description: '서로의 경험을 나누며 함께 배움' }
      ]
    },
    {
      id: 3,
      layout: 'question-left',
      questionNumber: '03',
      questionTitle: '어떻게 성장할 수 있나요?',
      questionIcon: '📈',
      answerTitle: '개인 맞춤형 성장 시스템',
      answerText: '획일적인 커리큘럼 대신, 각자의 관심사와 목표에 맞는 다양한 활동을 통해 성장할 수 있습니다. 스터디, 프로젝트, 경험 공유 등 원하는 방식으로 참여하세요.',
      features: [
        { icon: '📚', text: '자율적 스터디 그룹' },
        { icon: '🚀', text: '실험적 프로젝트' },
        { icon: '🎯', text: '목표 기반 학습' }
      ]
    }
  ];

  return (
    <section className="about section-background" id="about">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">성장도 게임이 될 수 있어</h2>
          <p className="section-subtitle">non-blocking으로 느슨하게, sync로 끈끈하게, fun()으로 즐겁게!</p>
        </div>

        <main className="about-container">
          {aboutSections.map((section) => {
            const questionBlockRef = useScrollAnimation('animate-in', { 
              threshold: 0.4,
              rootMargin: '0px 0px -50px 0px'
            });
            
            const answerBlockRef = useScrollAnimation('animate-in', { 
              threshold: 0.4,
              rootMargin: '0px 0px -50px 0px',
              delay: 200
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
                  <p className="answer-text">{section.answerText}</p>
                  
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
