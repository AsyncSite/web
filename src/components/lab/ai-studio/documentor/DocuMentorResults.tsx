import React from 'react';
import { DocuMentorContent, DocuMentorAnalysis, ReviewSection } from './types';
import styles from './DocuMentor.module.css';

interface Props {
  content: DocuMentorContent;
  analysis: DocuMentorAnalysis;
  onReset: () => void;
}

function DocuMentorResults({ content, analysis, onReset }: Props): React.ReactNode {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 60) return styles.scoreGood;
    if (score >= 40) return styles.scoreAverage;
    return styles.scorePoor;
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    if (score >= 60) return '😊';
    if (score >= 50) return '🤔';
    return '💪';
  };

  const reviewSections: ReviewSection[] = [
    {
      emoji: '😊',
      title: '잘하신 점',
      items: analysis.strengths,
      type: 'positive',
    },
    {
      emoji: '🛠️',
      title: '개선하면 좋을 점',
      items: analysis.improvements,
      type: 'improvement',
    },
    {
      emoji: '💡',
      title: '이렇게 해보세요',
      items: analysis.suggestions,
      type: 'suggestion',
    },
  ];

  const detailScores = [
    { label: '제목 어필력', score: analysis.titleScore, emoji: '🎯' },
    { label: '구조 완성도', score: analysis.structureScore, emoji: '🏗️' },
    { label: '가독성', score: analysis.readabilityScore, emoji: '📚' },
    { label: '톤 일관성', score: analysis.toneScore, emoji: '🎭' },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '도큐멘토 AI 리뷰 결과',
        text: `내 글이 ${analysis.overallScore}점을 받았어요! AI가 분석한 개선점을 확인해보세요.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(
        `도큐멘토 AI 리뷰 결과: ${analysis.overallScore}점\n${window.location.href}`
      );
      alert('링크가 복사되었어요! 📋');
    }
  };

  return (
    <div className={styles.resultsContainer}>
      {/* Header with URL and Actions */}
      <div className={styles.resultsHeader}>
        <div className={styles.urlInfo}>
          <span className={styles.urlLabel}>분석한 글</span>
          <a href={content.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
            {content.url}
            <span className={styles.linkIcon}>↗️</span>
          </a>
        </div>
        
        <div className={styles.headerActions}>
          <button onClick={handleShare} className={styles.shareButton}>
            📤 공유하기
          </button>
          <button onClick={onReset} className={styles.newReviewButton}>
            ✏️ 새 리뷰 받기
          </button>
        </div>
      </div>

      {/* Main Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.mainScore}>
          <div className={`${styles.scoreCircleLarge} ${getScoreColor(analysis.overallScore)}`}>
            <span className={styles.scoreNumber}>{analysis.overallScore}</span>
            <span className={styles.scoreLabel}>점</span>
          </div>
          <div className={styles.scoreEmoji}>{getScoreEmoji(analysis.overallScore)}</div>
        </div>
        
        {analysis.summary && (
          <p className={styles.scoreSummary}>{analysis.summary}</p>
        )}

        {/* Detail Scores */}
        <div className={styles.detailScores}>
          {detailScores.map((item) => (
            <div key={item.label} className={styles.detailScoreItem}>
              <span className={styles.detailEmoji}>{item.emoji}</span>
              <span className={styles.detailLabel}>{item.label}</span>
              <div className={styles.detailBar}>
                <div 
                  className={styles.detailBarFill}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className={styles.detailValue}>{item.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Sections */}
      <div className={styles.reviewSections}>
        {reviewSections.map((section) => (
          <div key={section.title} className={`${styles.reviewSection} ${styles[section.type]}`}>
            <h3 className={styles.reviewSectionTitle}>
              <span className={styles.sectionEmoji}>{section.emoji}</span>
              {section.title}
            </h3>
            <div className={styles.reviewItems}>
              {section.items.map((item, index) => (
                <div key={index} className={styles.reviewItem}>
                  <span className={styles.itemBullet}>
                    {section.type === 'positive' ? '✨' :
                     section.type === 'improvement' ? '💭' : '🎯'}
                  </span>
                  <span className={styles.itemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Keywords and Category */}
      {(analysis.keywords || analysis.category) && (
        <div className={styles.metadata}>
          {analysis.category && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>📂 카테고리</span>
              <span className={styles.metaValue}>{analysis.category}</span>
            </div>
          )}
          {analysis.keywords && analysis.keywords.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>🏷️ 키워드</span>
              <div className={styles.keywords}>
                {analysis.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <h3 className={styles.ctaTitle}>피드백을 반영해보세요! 💪</h3>
        <p className={styles.ctaText}>
          AI의 제안을 참고해서 글을 수정하면 더 많은 사람들이 읽고 싶어할 거예요
        </p>
        <div className={styles.ctaButtons}>
          <button onClick={() => window.open(content.url, '_blank')} className={styles.editButton}>
            📝 글 수정하러 가기
          </button>
          <button onClick={onReset} className={styles.anotherButton}>
            🔄 다른 글 리뷰 받기
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocuMentorResults;