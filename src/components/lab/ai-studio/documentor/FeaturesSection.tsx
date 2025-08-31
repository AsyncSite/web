import React from 'react';
import styles from './DocuMentor.module.css';

const FeaturesSection = () => {
  const features = [
    {
      emoji: '🎯',
      name: '제목 어필력',
      desc: '클릭하고 싶은 제목인지 체크해요'
    },
    {
      emoji: '🎨',
      name: '첫인상 분석',
      desc: '도입부가 흥미로운지 평가해요'
    },
    {
      emoji: '📚',
      name: '가독성 점수',
      desc: '술술 읽히는 글인지 확인해요'
    },
    {
      emoji: '🎭',
      name: '감정 톤',
      desc: '글의 분위기가 적절한지 봐요'
    },
    {
      emoji: '🏗️',
      name: '구조 체크',
      desc: '논리적 흐름을 점검해요'
    },
    {
      emoji: '💡',
      name: '개선 제안',
      desc: '구체적인 수정 방법을 알려드려요'
    }
  ];

  return (
    <div className={styles.features}>
      <h3 className={styles.featuresTitle}>뭘 봐주는데요? 🤔</h3>
      
      <div className={styles.featureCards}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.featureEmoji}>{feature.emoji}</div>
            <h3 className={styles.featureName}>{feature.name}</h3>
            <p className={styles.featureDesc}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;