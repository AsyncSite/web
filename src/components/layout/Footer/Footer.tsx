import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">
          <span className="logo-text">AsyncSite</span>
        </div>



        <div className="footer-copyright">
          <p>&copy; 2024 AsyncSite. All rights reserved.</p>
          <p>본 사이트의 모든 콘텐츠는 AsyncSite의 저작물입니다.</p>
          <p>무단 복제 및 배포를 금지합니다.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
