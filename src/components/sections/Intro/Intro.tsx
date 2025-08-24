import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.css';
import Header from '../../layout/Header';

const Intro: React.FC = () => {
  const starfieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starfield = starfieldRef.current;
    if (starfield) {
      const fragment = document.createDocumentFragment();
      
      for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = styles.star;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        fragment.appendChild(star);
      }
      
      starfield.appendChild(fragment);
    }
  }, []);

  return (
    <div className={styles.introWrapper}>
      {/* 우주 배경 */}
      <div className={styles.spaceBackground}></div>
      <div className={styles.starfield} ref={starfieldRef}></div>
      <div className={styles.orbitContainer}>
        <div className={`${styles.orbit} ${styles.orbit1}`}>
          <div className={styles.planet}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit2}`}>
          <div className={styles.planet}></div>
        </div>
        <div className={`${styles.orbit} ${styles.orbit3}`}>
          <div className={styles.planet}></div>
        </div>
      </div>

      

      {/* Header - Intro와 함께 움직임 */}
      <Header />

      {/* Hero Section */}
      <section id="intro" className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`${styles.heroTitleWrapper} ${styles.dropBounce}`}>
              <h1 className={styles.heroTitle}>
                AsyncSite
              </h1>
            </div>
            <p className={styles.heroSubtitle}>
              느슨히 끈끈히<br />
              성장이 일상이 되는 시간
            </p>
            <div className={styles.heroCta}>
              <a href="#studies" className="btn-primary">지금 모집 중인 스터디</a>
              <a href="#about" className="btn-secondary">Async Site 이야기</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;
