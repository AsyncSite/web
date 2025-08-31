import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import StudioHeader from './StudioHeader';
import styles from './StudioLayout.module.css';

const StudioLayout = () => {
  // Apply studio theme class to body
  useEffect(() => {
    // Add studio theme class to body
    document.body.classList.add('studio-theme');
    
    // Store previous body styles
    const previousBg = document.body.style.background;
    const previousOverflow = document.body.style.overflow;
    
    // Apply studio-specific body styles
    document.body.style.background = 'linear-gradient(180deg, #fff5f5 0%, #fff0e1 100%)';
    document.body.style.minHeight = '100vh';
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('studio-theme');
      document.body.style.background = previousBg;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className={styles.studioLayoutWrapper}>
      <StudioHeader />
      <div className={styles.studioContent}>
        <Suspense fallback={
          <div className={styles.studioLoading}>
            <div className={styles.loadingSpinner}>
              <span className={styles.loadingEmoji}>✨</span>
              <span className={styles.loadingText}>도큐멘토를 준비하고 있어요...</span>
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export default StudioLayout;