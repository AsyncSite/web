import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom'; // Link 컴포넌트 import

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
          <div className="footer-links"> {/* 새로운 div 추가 */}
            <Link to="/terms">이용 약관</Link> | <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
