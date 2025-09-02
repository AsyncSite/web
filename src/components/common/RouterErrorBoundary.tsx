import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import styles from './RouterErrorBoundary.module.css';

function RouterErrorBoundary(): React.ReactNode {
  const error = useRouteError();
  const navigate = useNavigate();

  // Handle different error types
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.errorCode}>404</div>
            <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
            <p className={styles.description}>
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.homeButton}
                onClick={() => navigate('/')}
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.errorCode}>401</div>
            <h1 className={styles.title}>접근 권한이 없습니다</h1>
            <p className={styles.description}>
              이 페이지에 접근하려면 로그인이 필요합니다.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.homeButton}
                onClick={() => navigate('/login')}
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (error.status === 503) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.errorCode}>503</div>
            <h1 className={styles.title}>서비스 점검 중</h1>
            <p className={styles.description}>
              잠시 후 다시 시도해주세요.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.homeButton}
                onClick={() => window.location.reload()}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Generic error
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>😵</div>
        <h1 className={styles.title}>문제가 발생했습니다</h1>
        <p className={styles.description}>
          예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className={styles.errorDetails}>
          {error instanceof Error && error.message}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </button>
          <button
            className={styles.backButton}
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouterErrorBoundary;