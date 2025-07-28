import React from 'react';
import './About.css';

interface CardContent {
  id: number;
  title: string;
  icon: string;
  description: string;
}

const About: React.FC = () => {
  // 카드 데이터 - prototype 디자인에 맞춰 3개로 구성
  const cards: CardContent[] = [
    {
      id: 1,
      title: '꾸준한 학습과 실천',
      icon: '🌱',
      description: '매일 작은 목표를 통해 함께 성장하며, 어제보다 나은 오늘을 만들어요. 작은 커밋들이 쌓여 큰 변화를 만든다는 믿음으로 함께 나아갑니다.'
    },
    {
      id: 2,
      title: '자유로운 지식 공유',
      icon: '💡',
      description: '스터디, 경험담, Q&A로 서로의 성장을 돕는 집단 지성을 추구해요. 각자의 경험과 지식을 나누며 함께 배우고 성장하는 공간입니다.'
    },
    {
      id: 3,
      title: '수평적 연결과 지지',
      icon: '🤝',
      description: '부담 없는 분위기에서 관심사를 기반으로 자유롭게 교류하고 응원해요. 따로 또 같이, 느슨히 그럼에도 끈끈한 개발자 커뮤니티입니다.'
    }
  ];

  return (
    <section className="about section-background" id="about">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">성장도 게임이 될 수 있어</h2>
          <p className="section-subtitle">non-blocking으로 느슨하게, sync로 끈끈하게, fun()으로 즐겁게!</p>
        </div>

        <div className="about-grid">
          {cards.map((card) => (
            <div key={card.id} className="about-card">
              <div className="about-icon">{card.icon}</div>
              <h3 className="about-title">{card.title}</h3>
              <p className="about-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
