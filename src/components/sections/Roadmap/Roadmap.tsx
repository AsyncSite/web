import React from 'react';
import styles from './Roadmap.module.css';

interface RoadmapItem {
  id: number;
  number: string;
  title: string;
  description: string;
  reward: string;
}

const Roadmap: React.FC = () => {
  const roadmapItems: RoadmapItem[] = [
    {
      id: 1,
      number: 'Step 01',
      title: '스터디를 통한 성장',
      description: '다양한 스터디 그룹에 참여하여 체계적으로 학습합니다. 동료들과 함께 목표를 설정하고 꾸준히 실력을 향상시켜 나가세요.',
      reward: '📚 스터디 마스터'
    },
    {
      id: 2,
      number: 'Step 02',
      title: '정기활동을 통한 회고',
      description: '정기적인 활동과 회고를 통해 성장을 점검합니다. 매주 진행 상황을 공유하고 피드백을 받으며 지속적으로 발전해요.',
      reward: '🔄 회고 전문가'
    },
    {
      id: 3,
      number: 'Step 03',
      title: '네트워킹으로 서로 자극',
      description: '다양한 개발자들과 네트워킹하며 서로에게 자극이 됩니다. 경험을 공유하고 새로운 관점을 얻으며 함께 성장해요.',
      reward: '🤝 네트워킹 리더'
    },
    {
      id: 4,
      number: 'Step 04',
      title: 'Lab 참여로 사이드프로젝트',
      description: 'AsyncSite Lab에 참여하여 실제 프로젝트를 경험합니다. 아이디어를 현실로 만들어보며 실무 경험을 쌓아보세요.',
      reward: '🧪 Lab 크리에이터'
    }
  ];

  return (
    <section className={`${styles.roadmap} section-background`} id="roadmap">
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>성장 로드맵</h2>
          <p className={styles.sectionSubtitle}>단계별 로드맵을 따라 체계적으로 성장해나갑니다</p>
        </div>

        <div className={styles.roadmapTimeline}>
          <div className={styles.timelineLine}></div>
          
          {roadmapItems.map((item) => (
            <div key={item.id} className={styles.roadmapItem}>
              <div className={styles.roadmapNumber}>{item.number}</div>
              <h3 className={styles.roadmapTitle}>{item.title}</h3>
              <p className={styles.roadmapDescription}>{item.description}</p>
              <span className={styles.roadmapReward}>{item.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
