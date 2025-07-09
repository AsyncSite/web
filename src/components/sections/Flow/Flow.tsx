import React from 'react';
import './Flow.css';

interface FlowStep {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const Flow: React.FC = () => {
  const flowSteps: FlowStep[] = [
    {
      id: 1,
      icon: '💡',
      title: '제안서 작성',
      description: '누구나 제안서를 작성해요'
    },
    {
      id: 2,
      icon: '👥',
      title: '운영진 협의 후 스터디 오픈',
      description: '운영진이 제안서를 검토하고, 승인된 스터디를 오픈합니다.'
    },
    {
      id: 3,
      icon: '🎨',
      title: '스터디원 모집',
      description: '스터디원 모집'
    },
    {
      id: 4,
      icon: '💻',
      title: '활동시작',
      description: '스터디 개설'
    }
  ];

  return (
    <section className="flow" id="flow">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">스터디 플로우</h2>
          <p className="section-subtitle">함께 성장하는 단계별 여정</p>
        </div>

        <div className="flow-timeline">
          <div className="flow-line"></div>
          <div className="flow-grid">
            {flowSteps.map((step) => (
              <div key={step.id} className="flow-step">
                <div className="flow-icon">{step.icon}</div>
                <h3 className="flow-title">{step.title}</h3>
                <p className="flow-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Flow;
