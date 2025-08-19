import React from 'react';
import styles from './ProfileImageUploadProgress.module.css';

interface ProfileImageUploadProgressProps {
  isVisible: boolean;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  errorMessage?: string;
  onClose?: () => void;
}

/**
 * Profile image upload progress indicator component
 * Shows a floating notification with upload progress
 */
function ProfileImageUploadProgress({
  isVisible,
  progress,
  status,
  errorMessage,
  onClose
}: ProfileImageUploadProgressProps): React.ReactNode {
  if (!isVisible) return null;

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return '프로필 이미지 업로드 중...';
      case 'processing':
        return '이미지 처리 중...';
      case 'success':
        return '업로드 완료!';
      case 'error':
        return '업로드 실패';
      default:
        return '업로드 중...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return '잠시만 기다려주세요';
      case 'success':
        return '프로필 이미지가 성공적으로 업데이트되었습니다';
      case 'error':
        return errorMessage || '다시 시도해주세요';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`${styles['profileImageUploadProgress-overlay-container']} ${
        status === 'success' ? styles['profileImageUploadProgress-success-container'] : ''
      } ${
        status === 'error' ? styles['profileImageUploadProgress-error-container'] : ''
      }`}
    >
      {onClose && (
        <button
          className={styles['profileImageUploadProgress-close-button']}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      )}

      <div className={styles['profileImageUploadProgress-content-wrapper']}>
        <div className={styles['profileImageUploadProgress-icon-section']}>
          {status === 'success' ? (
            <div className={styles['profileImageUploadProgress-success-icon']}>
              ✓
            </div>
          ) : status === 'error' ? (
            <div className={styles['profileImageUploadProgress-error-icon']}>
              ⚠
            </div>
          ) : (
            <>
              <div className={styles['profileImageUploadProgress-spinner-ring']} />
              <div className={styles['profileImageUploadProgress-icon-camera']}>
                📷
              </div>
            </>
          )}
        </div>

        <div className={styles['profileImageUploadProgress-text-section']}>
          <h4 
            className={`${styles['profileImageUploadProgress-title-text']} ${
              status === 'success' ? styles['profileImageUploadProgress-success-title'] : ''
            } ${
              status === 'error' ? styles['profileImageUploadProgress-error-title'] : ''
            }`}
          >
            {getStatusText()}
          </h4>
          
          <p 
            className={
              status === 'error' 
                ? styles['profileImageUploadProgress-error-message']
                : styles['profileImageUploadProgress-status-text']
            }
          >
            {getStatusDescription()}
          </p>

          {(status === 'uploading' || status === 'processing') && (
            <div style={{ position: 'relative' }}>
              <div className={styles['profileImageUploadProgress-bar-container']}>
                <div 
                  className={styles['profileImageUploadProgress-bar-fill']}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className={styles['profileImageUploadProgress-bar-shimmer']} />
                </div>
              </div>
              <span className={styles['profileImageUploadProgress-percent-text']}>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileImageUploadProgress;