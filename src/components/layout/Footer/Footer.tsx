import React from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';

function Footer(): React.ReactNode {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerCopyright}>
          <p>&copy; 2024 AsyncSite. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/terms">이용약관</Link>
            <span>&nbsp;·&nbsp;</span>
            <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
