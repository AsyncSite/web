import React from 'react';
import { HowWeRollData } from '../types/howWeRollTypes';
import styles from './HowWeRollSection.module.css';

interface HowWeRollSectionProps {
  data: HowWeRollData;
}

const HowWeRollSection: React.FC<HowWeRollSectionProps> = ({ data }) => {
  // CSS Module 스타일 사용
  const sectionClassName = styles.studyDetailHowWeRollSection;
  
  return (
    <section className={sectionClassName}>
      {data.tagHeader && (
        <div className={styles.sectionTagHeader}>{data.tagHeader}</div>
      )}

      <h2 className={styles.sectionTitle}>
        {data.title.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {line.split('그냥 계속').map((part, i) => (
              i === 0 ? part : <React.Fragment key={i}><span className={styles.highlight}>그냥 계속</span>{part}</React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </h2>
      
      {data.subtitle && (
        <p className={styles.sectionSubtitle}>{data.subtitle}</p>
      )}

      <div className={styles.meetingOverview}>
        {data.meetingOverview.map((item, index) => (
          <div key={index} className={`${styles.overviewCard} ${item.type === 'main-meeting' ? styles.mainMeeting : item.type === 'study-material' ? styles.studyMaterial : item.type === 'cost-info' ? styles.costInfo : ''}`}>
            <div className={styles.cardIcon}>{item.icon}</div>
            <div className={styles.cardContent}>
              <h3>{item.title}</h3>
              {item.link ? (
                <p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <span className={styles.highlight}>{item.highlight}</span>
                  </a>
                </p>
              ) : (
                <p>
                  <span className={styles.highlight}>{item.highlight}</span>
                </p>
              )}
              {item.description && (
                <p>
                  {item.description.split(' ').map((word, i) => {
                    // Highlight specific words
                    const highlightWords = ['오프라인', '중심으로', '백준,', '프로그래머스를'];
                    
                    if (highlightWords.includes(word)) {
                      const colorClass = word === '오프라인' || word === '중심으로' 
                        ? 'color-primary-text' 
                        : 'color-secondary-text';
                      return (
                        <span key={i} className={colorClass}>
                          {word}{' '}
                        </span>
                      );
                    }
                    return word + ' ';
                  })}
                </p>
              )}
              {item.subNote && <p className={styles.subNote}>{item.subNote}</p>}
            </div>
          </div>
        ))}
      </div>

      {data.subHeading && (
        <h3 className={styles.introSubHeading}>{data.subHeading}</h3>
      )}
      
      {data.scheduleIntro && (
        <p className={styles.scheduleIntro}>{data.scheduleIntro}</p>
      )}

      <div className={styles.activityTable}>
        <table>
          <thead>
            <tr>
              <th>시간</th>
              <th>무엇을</th>
            </tr>
          </thead>
          <tbody>
            {data.schedule.map((item, index) => (
              <tr key={index}>
                <td>
                  <strong>{item.time}</strong>
                </td>
                <td>
                  <span
                    className={
                      item.type === 'primary' ? 'color-primary-text' : 'color-secondary-text'
                    }
                  >
                    <strong>{item.activity}</strong>
                  </span>
                  <br />
                  <span className={styles.activityDetail}>{item.detail}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.closingMessage && (
        <div className={styles.closingMessage}>
          <p>
            {(() => {
              const highlightPhrase = '서로의 성장을 응원하는 따뜻한 커뮤니티';
              if (data.closingMessage.includes(highlightPhrase)) {
                const parts = data.closingMessage.split(highlightPhrase);
                return (
                  <>
                    {parts[0]}
                    <span className={styles.highlight}>{highlightPhrase}</span>
                    {parts[1]}
                  </>
                );
              }
              return data.closingMessage;
            })()}
          </p>
        </div>
      )}
    </section>
  );
};

export default HowWeRollSection;