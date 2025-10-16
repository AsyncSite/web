import React from 'react';
import { LeaderIntroData } from '../types/leaderIntroTypes';
import RichTextRenderer from '../../common/richtext/RichTextRenderer';
import styles from './LeaderIntroSection.module.css';

interface LeaderIntroSectionProps {
  data: LeaderIntroData;
}

const LeaderIntroSection: React.FC<LeaderIntroSectionProps> = ({ data }) => {
  // 프로필 이미지 에러 처리
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const initials = data.name ? data.name.charAt(0).toUpperCase() : '?';
    const colors = ['#C3E88D', '#82AAFF', '#FFCB6B', '#F78C6C', '#C792EA'];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" rx="60" fill="${bgColor}"/>
        <text x="60" y="75" font-size="48" text-anchor="middle" fill="#1a1a1a" font-family="Arial, sans-serif" font-weight="600">${initials}</text>
      </svg>
    `;
    e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    e.currentTarget.alt = '프로필 이미지';
  };

  // 경력 기간 계산 (심플하게 표시)
  const getExperienceDuration = () => {
    if (!data.experience?.since) return null;
    const sinceYear = parseInt(data.experience.since.match(/\d{4}/)?.[0] || '');
    if (!sinceYear) return data.experience.since;
    const currentYear = new Date().getFullYear();
    const years = currentYear - sinceYear + 1;
    return `스터디 ${years}년차`;
  };

  // Q&A 데이터 구성 (기존 필드 활용)
  const getQAItems = () => {
    const items = [];
    
    if (data.motivation) {
      items.push({
        question: "왜 이 스터디를 시작했나요?",
        answer: data.motivation
      });
    }
    
    if (data.philosophy) {
      items.push({
        question: "어떤 스터디를 만들고 싶나요?",
        answer: data.philosophy
      });
    }

    if (data.introduction && items.length < 2) {
      items.push({
        question: "리더님은 어떤 개발자인가요?",
        answer: data.introduction
      });
    }
    
    return items.slice(0, 2); // 최대 2개만
  };

  const qaItems = getQAItems();

  return (
    <section className={styles.studyDetailLeaderIntroSection}>
      <div className={styles.contentWrapper}>
        {/* 섹션 헤더 (옵션) */}
        {data.tagHeader && (
          <div className={styles.sectionTagHeader}>{data.tagHeader}</div>
        )}
        
        {/* 메인 타이틀 (옵션) */}
        {data.title && (
          <h2 className={styles.sectionTitle}>
            <RichTextRenderer data={data.title} />
          </h2>
        )}
        
        {/* 서브타이틀 (옵션) */}
        {data.subtitle && (
          <div className={styles.sectionSubtitle}>
            <RichTextRenderer data={data.subtitle} />
          </div>
        )}

        {/* 컴팩트 프로필 섹션 */}
        <div className={styles.compactProfile}>
          {/* 상단: 프로필 이미지 + 정보 (가로 배치) */}
          <div className={styles.profileHeader}>
            <div className={styles.profileImageCompact}>
              <img 
                src={data.profileImage || ''}
                alt={data.name}
                onError={handleImageError}
              />
              {getExperienceDuration() && (
                <div className={styles.experienceBadgeCompact}>
                  {getExperienceDuration()}
                </div>
              )}
            </div>
            
            <div className={styles.profileInfo}>
              <h3 className={styles.leaderNameCompact}>{data.name}</h3>
              {data.role && (
                <p className={styles.taglineCompact}>{data.role}</p>
              )}
              
              {/* 키워드 바로 아래 배치 */}
              {data.background?.expertise && data.background.expertise.length > 0 && (
                <div className={styles.keywordSectionCompact}>
                  {data.background.expertise.slice(0, 3).map((keyword, idx) => (
                    <span key={idx} className={styles.keywordBadgeCompact}>
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Q&A 스토리 (컴팩트 버전) */}
          {qaItems.length > 0 && (
            <div className={styles.qaContainer}>
              {qaItems.map((item, idx) => (
                <div key={idx} className={styles.qaItem}>
                  <div className={styles.qaQuestion}>
                    <span className={styles.qIconCompact}>Q.</span>
                    <span className={styles.questionTextCompact}>{item.question}</span>
                  </div>
                  <div className={styles.qaAnswer}>
                    <RichTextRenderer data={item.answer} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 환영 메시지 (한 줄로 심플하게) */}
          {data.welcomeMessage && (
            <div className={styles.welcomeCompact}>
              <span className={styles.welcomeIconCompact}>💝</span>
              <div className={styles.welcomeTextCompact}>
                <RichTextRenderer data={data.welcomeMessage} />
              </div>
            </div>
          )}

          {/* 하단 액션 영역 */}
          <div className={styles.actionArea}>
            {/* 연락 버튼 - 카카오톡 우선, 없으면 이메일 */}
            {data.showContactButton && (data.links?.kakaoTalk || data.links?.email) && (
              <a
                href={data.links?.kakaoTalk || `mailto:${data.links.email}`}
                target={data.links?.kakaoTalk ? "_blank" : undefined}
                rel={data.links?.kakaoTalk ? "noopener noreferrer" : undefined}
                className={styles.contactButtonCompact}
              >
                <span className={styles.coffeeIconCompact}>☕</span>
                {data.contactButtonText || '리더와 커피챗'}
              </a>
            )}
            
            {/* 소셜 링크 (아이콘만) */}
            <div className={styles.socialIconsCompact}>
              {data.links?.github && (
                <a href={data.links.github} target="_blank" rel="noopener noreferrer" 
                   className={styles.socialIconLink} title="GitHub">
                  <span>GitHub</span>
                </a>
              )}
              {data.links?.blog && (
                <a href={data.links.blog} target="_blank" rel="noopener noreferrer"
                   className={styles.socialIconLink} title="Blog">
                  <span>Blog</span>
                </a>
              )}
            </div>
          </div>

          {/* 운영 경험 (매우 미니멀하게, 옵션) */}
          {(data.experience?.totalStudies || data.experience?.totalMembers) && (
            <div className={styles.experienceLineCompact}>
              {data.experience.totalStudies && (
                <span className={styles.expItemCompact}>
                  {data.experience.totalStudies}개 스터디
                </span>
              )}
              {data.experience.totalStudies && data.experience.totalMembers && (
                <span className={styles.expDivider}>·</span>
              )}
              {data.experience.totalMembers && (
                <span className={styles.expItemCompact}>
                  {data.experience.totalMembers}명과 함께
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderIntroSection;