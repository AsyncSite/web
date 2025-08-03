import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom'; // Link 컴포넌트 import

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-copyright">
          <p>&copy; 2024 AsyncSite. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/terms">이용약관</Link>
            <span>&nbsp;·&nbsp;</span>
            <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
