import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './StudioHeader.module.css';

const StudioHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Store return URL for after login
    sessionStorage.setItem('documentor_return_url', '/studio/documentor');
    navigate('/login', {
      state: {
        from: '/studio/documentor',
        service: 'documento',
        branding: {
          title: '도큐멘토 ✏️',
          subtitle: '계속하려면 로그인이 필요해요'
        }
      }
    });
  };

  const handleSignup = () => {
    // Store return URL for after signup
    sessionStorage.setItem('documentor_return_url', '/studio/documentor');
    navigate('/signup', {
      state: {
        from: '/studio/documentor',
        service: 'documento',
        branding: {
          title: '도큐멘토 ✏️',
          subtitle: 'AI 글쓰기 친구와 함께하세요'
        }
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.studioHeader}>
      <div className={styles.headerContainer}>
        {/* Left: Logo and Brand */}
        <div className={styles.headerLeft}>
          <div className={styles.brandNav}>
            <Link to="/" className={styles.mainBrand}>AsyncSite</Link>
            <span className={styles.separator}>/</span>
            <span className={styles.currentService}>도큐멘토</span>
          </div>
        </div>

        {/* Right: User info and Navigation */}
        <div className={styles.headerRight}>
          {isAuthenticated && user ? (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userGreeting}>안녕하세요,</span>
                <span className={styles.userName}>{user.name || user.username}님</span>
              </div>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSignup}
                className={styles.signupButton}
              >
                회원가입
              </button>
              <button 
                onClick={handleLogin}
                className={styles.loginButton}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudioHeader;