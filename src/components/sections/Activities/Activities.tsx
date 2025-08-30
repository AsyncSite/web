import React from 'react';
import styles from './Activities.module.css';

interface ActivityItem {
  id: number;
  icon: string;
  title: string;
  schedule: string;
  description: string;
  participants: string[];
  totalParticipants: number;
}

const Activities: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: 1,
      icon: '💻',
      title: '테코테코 - 알고리즘 스터디',
      schedule: '매주 일요일 오전 10시',
      description: '매주 일요일 아침, 함께 모여 알고리즘 문제를 풀고 토론합니다. 서로의 코드를 리뷰하며 더 나은 해결책을 찾아갑니다.',
      participants: ['김', '이', '박', '최'],
      totalParticipants: 28
    },
    {
      id: 2,
      icon: '🌙',
      title: '11루틴 - 온라인 모각코',
      schedule: '매주 수요일 밤 11시',
      description: '퇴근 후 온라인으로 모여 각자의 프로젝트를 진행합니다. 서로 진행 상황을 공유하며 동기부여를 받습니다.',
      participants: ['정', '강', '조', '윤'],
      totalParticipants: 35
    },
    {
      id: 3,
      icon: '📚',
      title: '데브로그 - 블로그 챌린지',
      schedule: '격주 금요일',
      description: '2주에 한 번씩 기술 블로그를 작성하는 챌린지입니다. 꾸준한 기록으로 성장 과정을 남기고 공유합니다.',
      participants: ['한', '오', '서', '남'],
      totalParticipants: 22
    }
  ];

  return (
    <section className={`${styles.activities} section-background`} id="activities">
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>정기 활동</h2>
          <p className={styles.sectionSubtitle}>다양한 활동을 통해 꾸준히 성장합니다</p>
        </div>

        <div className={styles.activityGrid}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.activityCard}>
              <div className={styles.activityIcon}>{activity.icon}</div>
              <h3 className={styles.activityTitle}>{activity.title}</h3>
              <p className={styles.activitySchedule}>{activity.schedule}</p>
              <p className={styles.activityDescription}>{activity.description}</p>
              <div className={styles.activityParticipants}>
                <div className={styles.participantAvatars}>
                  {activity.participants.map((participant, index) => (
                    <div key={index} className={styles.avatar}>{participant}</div>
                  ))}
                </div>
                <span>+{activity.totalParticipants}명 참여중</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activities;
