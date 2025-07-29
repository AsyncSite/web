import React, { useEffect, useState } from 'react';
import './Studies.css';

interface StudyLeader {
  name: string;
  profileImage: string;
  welcomeMessage: string;
}

interface StudyInfo {
  id: number;
  name: string;
  generation: number;
  tagline: string;
  leader: StudyLeader;
  schedule: string;
  duration: string;
  capacity: number;
  enrolled: number;
  deadline: Date;
  recentTestimonial?: {
    content: string;
    author: string;
  };
  color: {
    primary: string;
    glow: string;
  };
}

const Studies: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  const calculateDaysLeft = (deadline: Date): number => {
    const diff = deadline.getTime() - currentTime.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const studies: StudyInfo[] = [
    {
      id: 1,
      name: '테코테코',
      generation: 3,
      tagline: '함께 풀어가는 알고리즘의 즐거움',
      leader: {
        name: '김준혁',
        profileImage: 'https://i.pravatar.cc/150?img=1',
        welcomeMessage: '알고리즘도 결국 사람이 푸는 거예요. 함께 고민하고 성장해요!'
      },
      schedule: '매주 금요일',
      duration: '19:30-21:30',
      capacity: 20,
      enrolled: 17,
      deadline: new Date('2024-12-25'),
      recentTestimonial: {
        content: '처음엔 어려웠지만, 동료들과 함께하니 재미있어졌어요',
        author: '2기 수료생'
      },
      color: {
        primary: '#C3E88D',
        glow: 'rgba(195, 232, 141, 0.3)'
      }
    },
    {
      id: 2,
      name: '11루틴',
      generation: 2,
      tagline: '퇴근 후 함께하는 성장의 시간',
      leader: {
        name: '이서연',
        profileImage: 'https://i.pravatar.cc/150?img=2',
        welcomeMessage: '혼자서는 지치기 쉬운 퇴근 후 공부, 함께라면 꾸준히 할 수 있어요'
      },
      schedule: '매주 수요일',
      duration: '23:00-24:00',
      capacity: 30,
      enrolled: 23,
      deadline: new Date('2024-12-20'),
      recentTestimonial: {
        content: '온라인이지만 진짜 동료를 만난 느낌이에요',
        author: '1기 수료생'
      },
      color: {
        primary: '#82AAFF',
        glow: 'rgba(130, 170, 255, 0.3)'
      }
    },
    {
      id: 3,
      name: 'DEVLOG-14',
      generation: 1,
      tagline: '기록하며 성장하는 개발자의 글쓰기',
      leader: {
        name: '박지민',
        profileImage: 'https://i.pravatar.cc/150?img=3',
        welcomeMessage: '꾸준한 기록은 가장 확실한 성장의 증거가 됩니다'
      },
      schedule: '격주 토요일',
      duration: '14:00-16:00',
      capacity: 15,
      enrolled: 12,
      deadline: new Date('2024-12-28'),
      recentTestimonial: {
        content: '글쓰기가 이렇게 즐거운 일인지 처음 알았어요',
        author: '현재 참여자'
      },
      color: {
        primary: '#F78C6C',
        glow: 'rgba(247, 140, 108, 0.3)'
      }
    }
  ];
  
  return (
    <section className="studies section-background" id="studies">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">당신을 기다리는 동료들</h2>
          <p className="section-subtitle">
            각자의 별에서 시작해, 함께 빛나는 여정으로
          </p>
        </div>
        
        <div className="studies-grid">
          {studies.map((study) => {
            const daysLeft = calculateDaysLeft(study.deadline);
            const spotsLeft = study.capacity - study.enrolled;
            const isAlmostFull = spotsLeft <= 5;
            const progressPercentage = (study.enrolled / study.capacity) * 100;
            
            return (
              <div 
                key={study.id} 
                className="study-card"
                style={{
                  '--study-primary': study.color.primary,
                  '--study-glow': study.color.glow
                } as React.CSSProperties}
              >
                {/* 스터디 헤더 */}
                <div className="study-header">
                  <div className="study-info">
                    <h3 className="study-name">
                      {study.name} <span className="study-generation">{study.generation}기</span>
                    </h3>
                    <p className="study-tagline">{study.tagline}</p>
                  </div>
                  {daysLeft <= 7 && (
                    <div className="deadline-badge">
                      D-{daysLeft}
                    </div>
                  )}
                </div>
                
                {/* 리더 소개 */}
                <div className="leader-section">
                  <img 
                    src={study.leader.profileImage} 
                    alt={study.leader.name}
                    className="leader-avatar"
                  />
                  <div className="leader-message">
                    <p className="leader-name">{study.leader.name} 리더</p>
                    <p className="welcome-message">"{study.leader.welcomeMessage}"</p>
                  </div>
                </div>
                
                {/* 스터디 정보 */}
                <div className="study-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>{study.schedule} {study.duration}</span>
                  </div>
                </div>
                
                {/* 참여 현황 */}
                <div className="participation-status">
                  <div className="status-text">
                    <span>{spotsLeft}분의 자리가 남았어요</span>
                    {isAlmostFull && <span className="almost-full">곧 마감</span>}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                {/* 최근 후기 */}
                {study.recentTestimonial && (
                  <div className="recent-testimonial">
                    <p>"{study.recentTestimonial.content}"</p>
                    <span>- {study.recentTestimonial.author}</span>
                  </div>
                )}
                
                {/* CTA 버튼 */}
                <a href={`/studies/${study.id}`} className="study-cta">
                  함께하기
                </a>
                
                {/* 별 장식 */}
                <div className="study-star"></div>
              </div>
            );
          })}
        </div>
        
        {/* 더 많은 스터디 안내 */}
        <div className="more-studies">
          <p className="more-text">더 많은 스터디가 준비 중이에요</p>
          <a href="/studies" className="more-link">
            모든 스터디 보기 →
          </a>
        </div>
      </div>
    </section>
  );
};

export default Studies;