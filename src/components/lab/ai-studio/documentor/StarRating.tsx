import React from 'react';
import styles from './DocuMentor.module.css';

interface StarRatingProps {
  rating: number; // 0-5
  label: string;
  comment?: string;
}

function StarRating({ rating, label, comment }: StarRatingProps): React.ReactNode {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className={styles.starFilled}>⭐</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className={styles.ratingItem}>
      <div className={styles.ratingHeader}>
        <span className={styles.ratingLabel}>{label}</span>
        <span className={styles.stars}>{renderStars()}</span>
      </div>
      {comment && (
        <p className={styles.ratingComment}>{comment}</p>
      )}
    </div>
  );
}

export default StarRating;