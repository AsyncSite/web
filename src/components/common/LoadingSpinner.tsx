import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({ message = '로딩 중...', fullScreen = true }: LoadingSpinnerProps): React.ReactNode {
  const content = (
    <div className="loading-spinner-content">
      <div className="loading-spinner-circle" />
      <p className="loading-spinner-message">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-container fullscreen">
        {content}
      </div>
    );
  }

  return (
    <div className="loading-spinner-container">
      {content}
    </div>
  );
}

export default LoadingSpinner;