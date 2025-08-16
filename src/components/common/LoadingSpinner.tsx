import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({ message = '로딩 중...', fullScreen = true }: LoadingSpinnerProps): React.ReactNode {
  const content = (
    <div className={styles['loading-spinner-content']}>
      <div className={styles['loading-spinner-circle']} />
      <p className={styles['loading-spinner-message']}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`${styles['loading-spinner-container']} ${styles.fullscreen}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={styles['loading-spinner-container']}>
      {content}
    </div>
  );
}

export default LoadingSpinner;