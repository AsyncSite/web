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

      {data.title && (
        <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: data.title.replace(/\n/g, '<br />') }} />
      )}
      
      {data.subtitle && (
        <p className={styles.sectionSubtitle} dangerouslySetInnerHTML={{ __html: data.subtitle.replace(/\n/g, '<br />') }} />
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
        <h3 className={styles.introSubHeading} dangerouslySetInnerHTML={{ __html: data.subHeading.replace(/\n/g, '<br />') }} />
      )}
      
      {data.scheduleIntro && (
        <p className={styles.scheduleIntro} dangerouslySetInnerHTML={{ __html: data.scheduleIntro.replace(/\n/g, '<br />') }} />
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
          <p dangerouslySetInnerHTML={{ __html: data.closingMessage.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </section>
  );
};

export default HowWeRollSection;