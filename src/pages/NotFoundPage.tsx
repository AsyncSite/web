import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

function NotFoundPage(): React.ReactNode {
  const navigate = useNavigate();

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
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;