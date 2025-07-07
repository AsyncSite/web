import React from 'react';
import { Link } from 'react-router-dom';
import './TemplateHeader.css';

interface TemplateHeaderProps {
  // 필요한 경우 props 추가
}

const TemplateHeader: React.FC<TemplateHeaderProps> = () => {
  return (
    <header className="template-header">
      <div className="template-header-inner">
        {/* 로고 */}
        <Link to="/" className="logo">
          <img src={process.env.PUBLIC_URL + '/assets/IlilmanLogo.svg'} alt="asyncsite 로고" />
        </Link>

        {/* 네비게이션 */}
        <nav>
          <ul>
            <li>
              <Link to="/">HOME</Link>
            </li>
            <li>
              <Link to="/lab">LAB</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default TemplateHeader;
